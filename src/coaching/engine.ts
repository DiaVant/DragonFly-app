import { COACHING_THRESHOLDS } from './thresholds';
import type { CoachingResult, CoachingStateId } from './types';

const COPY: Record<CoachingStateId, { title: string; detail: string; severity: CoachingResult['severity'] }> = {
  warming_up: {
    title: 'Reading the line…',
    detail: 'Gathering relative tension samples from DragonFly.',
    severity: 'info',
  },
  keep_reeling: {
    title: 'Keep reeling steadily',
    detail: 'Relative tension looks workable — smooth, even turns.',
    severity: 'ok',
  },
  let_run: {
    title: 'Let the fish run',
    detail: 'Tension is rising quickly. Give line rather than forcing it.',
    severity: 'caution',
  },
  ease_drag: {
    title: 'Ease the drag slightly',
    detail: 'Relative tension is high versus your recent baseline.',
    severity: 'alert',
  },
  raise_rod: {
    title: 'Raise the rod smoothly',
    detail: 'A controlled lift helps keep pressure without yanking.',
    severity: 'ok',
  },
  watch_slack: {
    title: 'Watch for slack',
    detail: 'Relative tension dropped — recover line before it goes slack.',
    severity: 'caution',
  },
  stabilized: {
    title: 'Tension stabilized',
    detail: 'The fight has settled. Stay smooth and patient.',
    severity: 'ok',
  },
  insufficient_data: {
    title: 'Waiting for signal',
    detail: 'Not enough samples yet for reliable coaching.',
    severity: 'info',
  },
};

export type Trend = 'rising' | 'falling' | 'stable' | 'unknown';

export interface SignalStats {
  latest: number | null;
  sampleCount: number;
  expectedCount: number | null;
  rollingAverage: number | null;
  recentAverage: number | null;
  trend: Trend;
  variability: number | null;
  min: number | null;
  max: number | null;
}

export function computeSignalStats(samples: number[], expectedCount: number | null = null): SignalStats {
  const sampleCount = samples.length;
  if (sampleCount === 0) {
    return {
      latest: null,
      sampleCount: 0,
      expectedCount,
      rollingAverage: null,
      recentAverage: null,
      trend: 'unknown',
      variability: null,
      min: null,
      max: null,
    };
  }

  const latest = samples[sampleCount - 1]!;
  const baselineWindow = samples.slice(-COACHING_THRESHOLDS.baselineWindow);
  const recentWindow = samples.slice(-COACHING_THRESHOLDS.recentWindow);
  const rollingAverage = mean(baselineWindow);
  const recentAverage = mean(recentWindow);
  const variability = coefficientOfVariation(recentWindow);
  const trend = deriveTrend(samples);
  const min = Math.min(...samples);
  const max = Math.max(...samples);

  return {
    latest,
    sampleCount,
    expectedCount,
    rollingAverage,
    recentAverage,
    trend,
    variability,
    min,
    max,
  };
}

function mean(values: number[]): number {
  return values.reduce((a, b) => a + b, 0) / values.length;
}

function coefficientOfVariation(values: number[]): number | null {
  if (values.length < 2) return null;
  const m = mean(values);
  if (m === 0) return null;
  const variance = values.reduce((acc, v) => acc + (v - m) ** 2, 0) / values.length;
  return Math.sqrt(variance) / Math.abs(m);
}

function deriveTrend(samples: number[]): Trend {
  if (samples.length < 4) return 'unknown';
  const recent = samples.slice(-COACHING_THRESHOLDS.recentWindow);
  const earlier = samples.slice(-COACHING_THRESHOLDS.recentWindow * 2, -COACHING_THRESHOLDS.recentWindow);
  if (earlier.length < 2) return 'unknown';
  const delta = mean(recent) - mean(earlier);
  const scale = Math.max(1, Math.abs(mean(earlier)));
  const ratio = delta / scale;
  if (ratio > 0.08) return 'rising';
  if (ratio < -0.08) return 'falling';
  return 'stable';
}

/**
 * Deterministic coaching decision from a sample series.
 * Pass `nowMs` and `previous` to enforce hold time and avoid flicker.
 */
export function evaluateCoaching(
  samples: number[],
  options?: {
    nowMs?: number;
    previous?: { id: CoachingStateId; sinceMs: number } | null;
    thresholds?: typeof COACHING_THRESHOLDS;
  }
): CoachingResult {
  const t = options?.thresholds ?? COACHING_THRESHOLDS;
  const nowMs = options?.nowMs ?? 0;
  const previous = options?.previous ?? null;
  const stats = computeSignalStats(samples);

  let nextId: CoachingStateId;

  if (stats.sampleCount === 0) {
    nextId = 'insufficient_data';
  } else if (stats.sampleCount < t.minSamplesForAdvice || stats.rollingAverage == null || stats.latest == null) {
    nextId = 'warming_up';
  } else {
    const baseline = stats.rollingAverage;
    const latest = stats.latest;
    const ratio = baseline === 0 ? 1 : latest / baseline;
    const prior = samples.length >= 2 ? samples[samples.length - 2]! : latest;
    const riseDelta = latest - prior;

    if (ratio >= t.highRatio) {
      nextId = 'ease_drag';
    } else if (ratio >= t.risingRatio && (stats.trend === 'rising' || riseDelta >= t.rapidRiseDelta)) {
      nextId = 'let_run';
    } else if (ratio <= t.slackRatio || (stats.trend === 'falling' && ratio < 1 - t.stableBand)) {
      nextId = 'watch_slack';
    } else if (stats.variability != null && stats.variability >= t.variabilityCv) {
      nextId = 'raise_rod';
    } else if (Math.abs(ratio - 1) <= t.stableBand && stats.trend === 'stable') {
      nextId = 'stabilized';
    } else {
      nextId = 'keep_reeling';
    }
  }

  if (previous && previous.id !== nextId && nowMs - previous.sinceMs < t.minHoldMs) {
    // Hold previous non-terminal advice to avoid flicker (still allow first warm-up upgrades).
    if (previous.id !== 'insufficient_data' && previous.id !== 'warming_up') {
      nextId = previous.id;
    } else if (nextId === 'insufficient_data') {
      nextId = previous.id;
    }
  }

  const copy = COPY[nextId];
  return {
    id: nextId,
    title: copy.title,
    detail: copy.detail,
    severity: copy.severity,
    relativeIndex: stats.latest,
    baseline: stats.rollingAverage,
    trend: stats.trend,
    variability: stats.variability,
  };
}

/** Summarize a finished fight into coaching bullets for the score screen. */
export function summarizeFight(
  samples: number[],
  outcome: 'landed' | 'lost' = 'landed'
): {
  summary: string;
  whatWentWell: string;
  improvement: string;
  events: { id: CoachingStateId; atSample: number; title: string }[];
} {
  if (samples.length < COACHING_THRESHOLDS.minSamplesForAdvice) {
    return {
      summary:
        outcome === 'lost'
          ? 'Not enough tension samples to diagnose this loss in detail — still worth saving the attempt.'
          : 'Not enough tension samples to coach this fight in detail.',
      whatWentWell:
        outcome === 'lost'
          ? 'You stayed with the fight and chose to review it instead of brushing it off.'
          : 'You completed the session and captured a catch score.',
      improvement:
        outcome === 'lost'
          ? 'Next time keep DragonFly connected for the full fight so we can pinpoint where the fish got away.'
          : 'Keep DragonFly connected for the full fight so coaching can calibrate to the line.',
      events: [],
    };
  }

  const stats = computeSignalStats(samples);
  const events: { id: CoachingStateId; atSample: number; title: string }[] = [];
  let prev: { id: CoachingStateId; sinceMs: number } | null = null;

  for (let i = 1; i <= samples.length; i++) {
    const slice = samples.slice(0, i);
    const result = evaluateCoaching(slice, { nowMs: i * 250, previous: prev });
    if (!prev || prev.id !== result.id) {
      events.push({ id: result.id, atSample: i, title: result.title });
      prev = { id: result.id, sinceMs: i * 250 };
    } else {
      prev = { id: result.id, sinceMs: prev.sinceMs };
    }
  }

  const highPeaks = events.filter((e) => e.id === 'ease_drag' || e.id === 'let_run').length;
  const slackEvents = events.filter((e) => e.id === 'watch_slack').length;
  const stable = events.some((e) => e.id === 'stabilized');

  let whatWentWell = 'You maintained contact with the fish through the fight.';
  if (stable) whatWentWell = 'You found stretches of stable relative tension — calm, controlled pressure.';
  else if (stats.variability != null && stats.variability < COACHING_THRESHOLDS.variabilityCv) {
    whatWentWell = 'Relative tension stayed fairly consistent — a good sign for beginners.';
  }

  let improvement = 'Focus on smooth reel turns and small rod adjustments.';
  if (highPeaks > 0) improvement = 'When tension spikes, ease the drag or let the fish run before forcing the reel.';
  else if (slackEvents > 0) improvement = 'Watch for sudden drops — recover line quickly to avoid slack.';

  let summary = stable
    ? 'A controlled fight with moments of stable line pressure.'
    : highPeaks > 0
      ? 'An active fight with rising tension — coaching focused on protecting the line.'
      : 'A steady fight guided by relative tension changes.';

  if (outcome === 'lost') {
    summary =
      slackEvents > highPeaks
        ? 'The fish got away — relative tension drops suggest slack may have cost the hookset.'
        : highPeaks > 0
          ? 'The fish got away — rising tension spikes suggest the drag or rod angle may have been too aggressive.'
          : 'The fish got away — review the tension trend below and pick one thing to fix next fight.';
    whatWentWell =
      'Ending the fight honestly is how beginners improve — this session is still a win for learning.';
    if (slackEvents > 0) {
      improvement =
        'Practice recovering line the instant tension drops. Slack is the most common way a fish shakes free.';
    } else if (highPeaks > 0) {
      improvement =
        'On the next run, ease drag earlier and let the fish take line instead of muscling through spikes.';
    } else {
      improvement =
        'Replay the last 20 seconds of the trend: stay smoother on the reel and keep steady rod pressure to the net.';
    }
  }

  return { summary, whatWentWell, improvement, events: events.slice(0, 12) };
}
