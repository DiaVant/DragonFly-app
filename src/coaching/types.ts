export type CoachingStateId =
  | 'warming_up'
  | 'keep_reeling'
  | 'let_run'
  | 'ease_drag'
  | 'raise_rod'
  | 'watch_slack'
  | 'stabilized'
  | 'insufficient_data';

export interface CoachingResult {
  id: CoachingStateId;
  title: string;
  detail: string;
  severity: 'info' | 'ok' | 'caution' | 'alert';
  relativeIndex: number | null;
  baseline: number | null;
  trend: 'rising' | 'falling' | 'stable' | 'unknown';
  variability: number | null;
}

export interface CoachingEvent {
  id: CoachingStateId;
  atSample: number;
  title: string;
}

export interface SessionAnalytics {
  sampleCount: number;
  averageSignal: number | null;
  minimumSignal: number | null;
  maximumSignal: number | null;
  signalVariability: number | null;
  /** Downsampled series for storage (bounded). */
  relativeTensionSeries: number[];
  coachingSummary: string;
  coachingEvents: CoachingEvent[];
  whatWentWell: string;
  improvement: string;
}
