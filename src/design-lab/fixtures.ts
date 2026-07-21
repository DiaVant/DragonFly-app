import type { BleConnectionStatus, Catch, CatchForm } from '../types';
import type { CoachingResult } from '../coaching/types';
import { evaluateCoaching } from '../coaching/engine';
import { buildSessionAnalytics } from '../coaching/analytics';
import { catchPhotoUri } from '../lib/defaultPhotos';

/** Development-only fixtures. Never written to production catch storage. */
export const DESIGN_LAB_ENABLED =
  (typeof __DEV__ !== 'undefined' ? __DEV__ : process.env.NODE_ENV !== 'production') &&
  process.env.EXPO_PUBLIC_DESIGN_LAB === 'true';

export type DesignLabStateId =
  | 'disconnected'
  | 'connecting'
  | 'connected'
  | 'connection_error'
  | 'fishing_ready'
  | 'starting_session'
  | 'fight_low'
  | 'fight_stable'
  | 'fight_rising'
  | 'fight_high'
  | 'ending_fight'
  | 'catch_score'
  | 'fight_lost'
  | 'catch_details'
  | 'journey_empty'
  | 'journey_multiple'
  | 'detail_with_photo'
  | 'detail_no_photo'
  | 'long_text'
  | 'missing_optional'
  | 'loading'
  | 'general_error';

export const DESIGN_LAB_STATES: { id: DesignLabStateId; label: string; group: string }[] = [
  { id: 'disconnected', label: 'Disconnected device', group: 'Home' },
  { id: 'connecting', label: 'Connecting device', group: 'Home' },
  { id: 'connected', label: 'Connected device', group: 'Home' },
  { id: 'connection_error', label: 'Connection error', group: 'Home' },
  { id: 'fishing_ready', label: 'Fishing ready', group: 'Fishing' },
  { id: 'starting_session', label: 'Starting session', group: 'Fishing' },
  { id: 'fight_low', label: 'Active fight — low tension', group: 'Fight' },
  { id: 'fight_stable', label: 'Active fight — stable', group: 'Fight' },
  { id: 'fight_rising', label: 'Active fight — rising', group: 'Fight' },
  { id: 'fight_high', label: 'Active fight — high', group: 'Fight' },
  { id: 'ending_fight', label: 'Ending fight', group: 'Fight' },
  { id: 'catch_score', label: 'Catch score (landed)', group: 'Score' },
  { id: 'fight_lost', label: "Didn't land review", group: 'Score' },
  { id: 'catch_details', label: 'Catch details form', group: 'Score' },
  { id: 'journey_empty', label: 'Empty Journey', group: 'Journey' },
  { id: 'journey_multiple', label: 'Journey with catches', group: 'Journey' },
  { id: 'detail_with_photo', label: 'Detail with photo', group: 'Journey' },
  { id: 'detail_no_photo', label: 'Detail without photo', group: 'Journey' },
  { id: 'long_text', label: 'Long species/location', group: 'Journey' },
  { id: 'missing_optional', label: 'Missing optional data', group: 'Journey' },
  { id: 'loading', label: 'Loading state', group: 'System' },
  { id: 'general_error', label: 'General error state', group: 'System' },
];

function series(pattern: 'low' | 'stable' | 'rising' | 'high'): number[] {
  const out: number[] = [];
  for (let i = 0; i < 24; i++) {
    if (pattern === 'low') {
      out.push(i < 12 ? 48 + Math.sin(i / 2) : 34 + Math.sin(i) * 1.5);
    } else if (pattern === 'stable') {
      out.push(50 + Math.sin(i / 2.5) * 1.8);
    } else if (pattern === 'rising') {
      out.push(i < 14 ? 48 + Math.sin(i / 3) : 48 + (i - 13) * 4.5);
    } else {
      out.push(i < 18 ? 46 + Math.sin(i / 2) * 2 : 72 + (i - 17) * 6);
    }
  }
  return out.map((v) => Number(v.toFixed(2)));
}

export const FIXTURE_SAMPLES = {
  low: series('low'),
  stable: series('stable'),
  rising: series('rising'),
  high: series('high'),
};

export function fixtureCoaching(samples: number[]): CoachingResult {
  return evaluateCoaching(samples, { nowMs: 60_000, previous: null });
}

const analyticsStable = buildSessionAnalytics(FIXTURE_SAMPLES.stable);

export const FIXTURE_CATCHES: Catch[] = [
  {
    id: 'lab-1',
    species: 'Rainbow Trout',
    score: 78,
    fightSeconds: 64,
    size: '18',
    weight: '2.6',
    location: 'Lake Sammamish',
    date: 'July 18, 2026',
    time: '6:42 AM',
    photo: true,
    imageUri: catchPhotoUri('trout'),
    sampleCount: analyticsStable.sampleCount,
    averageSignal: analyticsStable.averageSignal ?? undefined,
    minimumSignal: analyticsStable.minimumSignal ?? undefined,
    maximumSignal: analyticsStable.maximumSignal ?? undefined,
    signalVariability: analyticsStable.signalVariability ?? undefined,
    relativeTensionSeries: analyticsStable.relativeTensionSeries,
    coachingSummary: analyticsStable.coachingSummary,
    coachingEvents: analyticsStable.coachingEvents,
    whatWentWell: analyticsStable.whatWentWell,
    improvement: analyticsStable.improvement,
  },
  {
    id: 'lab-2',
    species: 'Largemouth Bass',
    score: 85,
    fightSeconds: 112,
    size: '16',
    weight: '3.1',
    location: 'Lake Washington',
    date: 'July 15, 2026',
    time: '7:05 AM',
    photo: true,
    imageUri: catchPhotoUri('bass'),
  },
  {
    id: 'lab-3',
    species: '',
    score: 61,
    fightSeconds: 33,
    size: '',
    weight: '',
    location: '',
    date: 'July 12, 2026',
    time: '5:58 AM',
    photo: false,
  },
  {
    id: 'lab-long',
    species: 'Westslope Cutthroat Trout (coastal hybrid strain)',
    score: 72,
    fightSeconds: 95,
    size: '21.5',
    weight: '4.25',
    location: 'Upper North Fork of the Snoqualmie River near the old logging bridge trailhead',
    date: 'July 10, 2026',
    time: '8:19 AM',
    photo: true,
    imageUri: catchPhotoUri('cutthroat'),
  },
];

export const FIXTURE_LOCATIONS = [
  'Lake Sammamish',
  'Lake Washington',
  'Snoqualmie River',
  'Green Lake',
  'Lake Union',
];

export const FIXTURE_FORM: CatchForm = {
  species: 'Rainbow Trout',
  size: '17',
  weight: '2.3',
  photo: true,
  imageUri: catchPhotoUri('trout'),
};

export const FIXTURE_SCORE_CATCH: Catch = {
  ...FIXTURE_CATCHES[0]!,
  id: 'lab-score',
  species: '',
  size: '',
  weight: '',
  photo: false,
  imageUri: undefined,
  outcome: 'landed',
};

export const FIXTURE_LOST_CATCH: Catch = {
  ...FIXTURE_SCORE_CATCH,
  id: 'lab-lost',
  outcome: 'lost',
  score: 61,
  fightSeconds: 47,
  coachingSummary:
    'The fish got away — rising tension spikes suggest the drag or rod angle may have been too aggressive.',
  whatWentWell:
    'Ending the fight honestly is how beginners improve — this session is still a win for learning.',
  improvement:
    'On the next run, ease drag earlier and let the fish take line instead of muscling through spikes.',
};

export function connectionForState(id: DesignLabStateId): {
  status: BleConnectionStatus;
  connecting: boolean;
  error: string | null;
} {
  switch (id) {
    case 'connecting':
      return { status: 'connecting', connecting: true, error: null };
    case 'connected':
    case 'fishing_ready':
    case 'fight_low':
    case 'fight_stable':
    case 'fight_rising':
    case 'fight_high':
    case 'ending_fight':
    case 'catch_score':
    case 'fight_lost':
    case 'catch_details':
      return { status: 'connected', connecting: false, error: null };
    case 'connection_error':
      return {
        status: 'disconnected',
        connecting: false,
        error: 'DragonFly 1.0 not found. Make sure it is powered on and nearby.',
      };
    case 'starting_session':
      return { status: 'connecting', connecting: true, error: null };
    default:
      return { status: 'disconnected', connecting: false, error: null };
  }
}
