export type Tab = 'home' | 'social' | 'fishing' | 'journey' | 'settings';
export type Phase = 'ready' | 'active' | 'score' | 'lost' | 'details' | 'gear';
export type Route =
  | 'home'
  | 'ready'
  | 'active'
  | 'score'
  | 'lost'
  | 'details'
  | 'empty'
  | 'gallery'
  | 'detail'
  | 'social'
  | 'gear'
  | 'settings';

export interface CoachingEventStored {
  id: string;
  atSample: number;
  title: string;
}

export type FightOutcome = 'landed' | 'lost';

/**
 * Catch record. Required fields match the original schema so old AsyncStorage
 * data continues to load. Optional analytics / imageUri / outcome are additive.
 */
export interface Catch {
  id: string;
  species: string;
  score: number;
  fightSeconds: number;
  size: string;
  weight: string;
  location: string;
  date: string;
  time: string;
  /** Legacy boolean photo flag — still written for backward compatibility. */
  photo: boolean;
  /** Real image URI when the user picks a photo (optional). */
  imageUri?: string;
  /** landed (default) or lost — lost fights still keep coaching for learning. */
  outcome?: FightOutcome;
  sampleCount?: number;
  averageSignal?: number;
  minimumSignal?: number;
  maximumSignal?: number;
  signalVariability?: number;
  relativeTensionSeries?: number[];
  coachingSummary?: string;
  coachingEvents?: CoachingEventStored[];
  whatWentWell?: string;
  improvement?: string;
  /** How score was produced. */
  scoreSource?: 'average' | 'openai';
  /** Short AI rationale for the score (optional). */
  scoreRationale?: string;
  /** Model id when scoreSource is openai. */
  aiModel?: string;
  /** Gear used for calibration context. */
  rodId?: string;
  lineId?: string;
}

/** Bundled outing shared to Social like a Strava activity. */
export interface FishingTrip {
  id: string;
  title: string;
  location: string;
  date: string;
  catchIds: string[];
  createdAt: string;
  caption?: string;
}

export interface CatchForm {
  species: string;
  size: string;
  weight: string;
  photo: boolean;
  imageUri?: string;
}

export type BleConnectionStatus = 'disconnected' | 'connecting' | 'connected';

export interface DragonflySessionFile {
  startedAt: string;
  stoppedAt: string | null;
  expectedCount: number | null;
  sampleCount: number;
  values: number[];
  average: number | null;
  finalScore: number | null;
  error?: string;
}

export type JourneySort = 'newest' | 'score' | 'duration';
