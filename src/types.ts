export type Tab = 'home' | 'fishing' | 'journey';
export type Phase = 'ready' | 'active' | 'score' | 'details';
export type Route = 'home' | 'ready' | 'active' | 'score' | 'details' | 'empty' | 'gallery' | 'detail';

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
  photo: boolean;
}

export interface CatchForm {
  species: string;
  size: string;
  weight: string;
  photo: boolean;
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
