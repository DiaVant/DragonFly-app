import { COACHING_THRESHOLDS } from './thresholds';
import { computeSignalStats, type Trend } from './engine';

export type DragAction = 'ease' | 'hold' | 'recover';

export interface DragAdvice {
  /** Relative suggestion 1–10 (low = ease drag, high = recover line). */
  value: number;
  action: DragAction;
  label: string;
  /** One short reason for the live UI. */
  reason: string;
}

export interface DragAdviceOptions {
  previous?: { value: number; action: DragAction; sinceMs: number } | null;
  nowMs?: number;
  thresholds?: typeof COACHING_THRESHOLDS;
}

/**
 * Anticipatory relative-drag advisor.
 * Uses baseline ratio, trend, rise rate, and variability — not only the latest sample.
 * Language stays relative (not calibrated pounds / click settings).
 */
export function evaluateDragAdvice(samples: number[], options?: DragAdviceOptions): DragAdvice {
  const t = options?.thresholds ?? COACHING_THRESHOLDS;
  const nowMs = options?.nowMs ?? Date.now();
  const previous = options?.previous ?? null;
  const stats = computeSignalStats(samples);

  let raw: DragAdvice;

  if (stats.sampleCount < t.minSamplesForAdvice || stats.latest == null || stats.rollingAverage == null) {
    raw = {
      value: 5.5,
      action: 'hold',
      label: 'Hold drag',
      reason: 'Gathering a relative tension read…',
    };
  } else {
    const baseline = Math.max(1, stats.rollingAverage);
    const latest = stats.latest;
    const ratio = latest / baseline;
    const riseRate = computeRiseRate(samples, t.recentWindow);
    const chatter = stats.variability != null && stats.variability >= t.variabilityCv;

    raw = decideDrag({
      ratio,
      riseRate,
      trend: stats.trend,
      chatter,
      t,
    });
  }

  // Smooth the continuous index so the slider doesn't thrash.
  const smoothedValue = previous
    ? Number((previous.value * 0.62 + raw.value * 0.38).toFixed(2))
    : raw.value;

  let action = raw.action;
  let label = raw.label;
  let reason = raw.reason;

  // Hold discrete action briefly to avoid Ease/Hold/Recover flicker.
  if (
    previous &&
    previous.action !== action &&
    nowMs - previous.sinceMs < t.dragMinHoldMs
  ) {
    action = previous.action;
    label = labelForAction(action);
    reason = raw.reason; // allow reason to update under the held action
  }

  // Keep value consistent with the held action band.
  const value = clampToActionBand(smoothedValue, action);

  return { value, action, label, reason };
}

function decideDrag(input: {
  ratio: number;
  riseRate: number;
  trend: Trend;
  chatter: boolean;
  t: typeof COACHING_THRESHOLDS;
}): DragAdvice {
  const { ratio, riseRate, trend, chatter, t } = input;

  // Hard ease — already high vs baseline.
  if (ratio >= t.highRatio || riseRate >= t.dragSurgeRate) {
    return {
      value: 2.1,
      action: 'ease',
      label: 'Ease drag',
      reason: 'High relative tension — ease before the line loads harder.',
    };
  }

  // Anticipatory ease — climbing toward trouble.
  if (
    (trend === 'rising' && ratio >= t.dragAnticipateRatio) ||
    riseRate >= t.dragRiseRate
  ) {
    return {
      value: 3.2,
      action: 'ease',
      label: 'Ease drag',
      reason: 'Tension climbing — ease a touch before the spike.',
    };
  }

  // Chatter / unstable pressure — ease slightly to settle.
  if (chatter && ratio >= 1) {
    return {
      value: 3.6,
      action: 'ease',
      label: 'Ease drag',
      reason: 'Pressure is jumpy — ease slightly and smooth the rod.',
    };
  }

  // Slack / falling contact — recover line (not crank drag blindly).
  if (ratio <= t.slackRatio || (trend === 'falling' && ratio < 1 - t.stableBand)) {
    const strong = ratio <= t.slackRatio * 0.92;
    return {
      value: strong ? 8.6 : 7.4,
      action: 'recover',
      label: 'Recover line',
      reason: strong
        ? 'Contact dropped — recover line before it goes slack.'
        : 'Tension falling — pick up line smoothly.',
    };
  }

  // Settled fight.
  if (Math.abs(ratio - 1) <= t.stableBand && trend === 'stable') {
    return {
      value: 5.2,
      action: 'hold',
      label: 'Hold drag',
      reason: 'Stable relative pressure — hold and stay smooth.',
    };
  }

  return {
    value: 5.4,
    action: 'hold',
    label: 'Hold drag',
    reason: 'Workable tension — keep drag steady.',
  };
}

/** Mean(recent) − mean(earlier), in index units. */
function computeRiseRate(samples: number[], recentWindow: number): number {
  if (samples.length < recentWindow + 2) return 0;
  const recent = samples.slice(-recentWindow);
  const earlier = samples.slice(-recentWindow * 2, -recentWindow);
  if (earlier.length < 2) return 0;
  const mean = (xs: number[]) => xs.reduce((a, b) => a + b, 0) / xs.length;
  return mean(recent) - mean(earlier);
}

function labelForAction(action: DragAction): string {
  switch (action) {
    case 'ease':
      return 'Ease drag';
    case 'recover':
      return 'Recover line';
    default:
      return 'Hold drag';
  }
}

function clampToActionBand(value: number, action: DragAction): number {
  if (action === 'ease') return Number(Math.max(1.2, Math.min(4.0, value)).toFixed(2));
  if (action === 'recover') return Number(Math.max(6.5, Math.min(9.6, value)).toFixed(2));
  return Number(Math.max(4.2, Math.min(6.2, value)).toFixed(2));
}
