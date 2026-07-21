import { summarizeFight, computeSignalStats } from './engine';
import type { SessionAnalytics } from './types';

/** Max points stored on a Catch to keep AsyncStorage bounded. */
export const MAX_STORED_SERIES = 48;

export function downsampleSeries(values: number[], maxPoints = MAX_STORED_SERIES): number[] {
  if (values.length <= maxPoints) return [...values];
  const out: number[] = [];
  const step = (values.length - 1) / (maxPoints - 1);
  for (let i = 0; i < maxPoints; i++) {
    const idx = Math.round(i * step);
    out.push(values[idx]!);
  }
  return out;
}

export function buildSessionAnalytics(
  samples: number[],
  outcome: 'landed' | 'lost' = 'landed'
): SessionAnalytics {
  const stats = computeSignalStats(samples);
  const fight = summarizeFight(samples, outcome);
  return {
    sampleCount: samples.length,
    averageSignal: stats.rollingAverage != null || samples.length
      ? Number((samples.reduce((a, b) => a + b, 0) / Math.max(samples.length, 1)).toFixed(2))
      : null,
    minimumSignal: stats.min,
    maximumSignal: stats.max,
    signalVariability: stats.variability != null ? Number(stats.variability.toFixed(3)) : null,
    relativeTensionSeries: downsampleSeries(samples),
    coachingSummary: fight.summary,
    coachingEvents: fight.events,
    whatWentWell: fight.whatWentWell,
    improvement: fight.improvement,
  };
}
