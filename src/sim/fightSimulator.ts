/**
 * Live fight simulation — generates relative tension samples in real time.
 * Not calibrated force or physical drag. For demos / Design Lab / no-hardware testing.
 *
 * Tension: continuous envelope + multi-frequency oscillation so the trend chart
 * visibly moves. Drag advice is computed in the UI via `evaluateDragAdvice`.
 */

export type SimPhase = 'warmup' | 'stable' | 'rising' | 'high' | 'slack' | 'recover';

export interface SimSample {
  value: number;
  phase: SimPhase;
  atMs: number;
}

const PHASE_ORDER: { phase: SimPhase; durationMs: number }[] = [
  { phase: 'warmup', durationMs: 2800 },
  { phase: 'stable', durationMs: 4500 },
  { phase: 'rising', durationMs: 3800 },
  { phase: 'high', durationMs: 4200 },
  { phase: 'slack', durationMs: 2800 },
  { phase: 'recover', durationMs: 4000 },
  { phase: 'stable', durationMs: 5000 },
  { phase: 'rising', durationMs: 4500 },
  { phase: 'high', durationMs: 3800 },
  { phase: 'recover', durationMs: 5500 },
];

function phaseAt(elapsedMs: number): SimPhase {
  let t = 0;
  const total = PHASE_ORDER.reduce((s, p) => s + p.durationMs, 0);
  const looped = elapsedMs % total;
  for (const step of PHASE_ORDER) {
    t += step.durationMs;
    if (looped < t) return step.phase;
  }
  return 'stable';
}

/** Center target for each phase — oscillation rides on top. */
function envelopeForPhase(phase: SimPhase, elapsedMs: number, prev: number): number {
  switch (phase) {
    case 'warmup':
      return 40 + Math.min(12, elapsedMs / 220);
    case 'stable':
      return 52;
    case 'rising':
      return Math.min(78, prev + 0.35);
    case 'high':
      return 80;
    case 'slack':
      return Math.max(26, prev - 0.7);
    case 'recover':
      return prev * 0.94 + 50 * 0.06;
    default:
      return 50;
  }
}

/**
 * Visible multi-frequency wobble so the trend chart oscillates, not just
 * slowly drifts between phase centers.
 */
function oscillation(elapsedMs: number, phase: SimPhase): number {
  const t = elapsedMs / 1000;
  const amp =
    phase === 'high' ? 9 : phase === 'rising' ? 7 : phase === 'slack' ? 5 : phase === 'warmup' ? 3.5 : 5.5;
  return (
    Math.sin(t * 2.4) * amp +
    Math.sin(t * 5.1) * (amp * 0.35) +
    Math.sin(t * 0.7) * (amp * 0.55) +
    Math.sin(t * 11.0) * 1.1
  );
}

/**
 * @deprecated Prefer evaluateDragAdvice(samples) — kept for one-off demos.
 * Continuous drag advice from a single tension reading.
 */
export function dragFromTension(value: number): number {
  const clamped = Math.max(20, Math.min(95, value));
  const t = (clamped - 20) / 75;
  const raw = 9.5 - t * 8.3;
  const wobble = Math.sin(clamped / 6) * 0.25;
  return Number(Math.max(1, Math.min(10, raw + wobble)).toFixed(2));
}

function makeSample(elapsedMs: number, prev: number): { sample: SimSample; nextPrev: number } {
  const phase = phaseAt(elapsedMs);
  const envelope = envelopeForPhase(phase, elapsedMs, prev);
  const value = Number(Math.max(18, Math.min(96, envelope + oscillation(elapsedMs, phase))).toFixed(2));
  const nextPrev = value * 0.35 + envelope * 0.65;
  return {
    sample: {
      value,
      phase,
      atMs: elapsedMs,
    },
    nextPrev,
  };
}

export function createFightSimulator(options?: { intervalMs?: number }) {
  const intervalMs = options?.intervalMs ?? 120;
  let timer: ReturnType<typeof setInterval> | null = null;
  let startedAt = 0;
  let prev = 45;

  return {
    start(onSample: (sample: SimSample) => void) {
      if (timer) clearInterval(timer);
      timer = null;
      startedAt = Date.now();
      prev = 45;

      const emit = () => {
        const elapsedMs = Date.now() - startedAt;
        const { sample, nextPrev } = makeSample(elapsedMs, prev);
        prev = nextPrev;
        onSample(sample);
      };

      emit(); // immediate first sample so UI isn't empty
      timer = setInterval(emit, intervalMs);
    },
    stop() {
      if (timer) clearInterval(timer);
      timer = null;
    },
    get running() {
      return timer != null;
    },
  };
}

export type FightSimulator = ReturnType<typeof createFightSimulator>;
