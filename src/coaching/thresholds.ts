/**
 * Coaching thresholds for the relative tension prototype.
 *
 * IMPORTANT: These values are NOT calibrated to physical force, drag setting,
 * or fish size. BLE samples are treated as a unitless relative tension index.
 * Hardware calibration with real DragonFly units is required before shipping
 * coaching advice as authoritative.
 */

export const COACHING_THRESHOLDS = {
  /** Minimum samples before strong coaching advice is shown. */
  minSamplesForAdvice: 6,

  /** Samples used for the rolling baseline average. */
  baselineWindow: 10,

  /** Recent window for trend / variability. */
  recentWindow: 5,

  /** Hold a coaching state at least this many ms before switching. */
  minHoldMs: 1800,

  /**
   * Latest value vs baseline — ratios are relative, not pounds.
   * Requires hardware calibration.
   */
  risingRatio: 1.18,
  highRatio: 1.42,
  slackRatio: 0.82,

  /** Absolute delta (index units) that counts as a rapid rise. */
  rapidRiseDelta: 8,

  /** Coefficient of variation above which we call tension unstable. */
  variabilityCv: 0.22,

  /** Near-baseline band considered "stable". */
  stableBand: 0.1,

  /**
   * Relative drag advisor (anticipatory).
   * Ease before highRatio when climb rate / trend says a spike is building.
   */
  /** Latest/baseline above this + rising → ease early. */
  dragAnticipateRatio: 1.1,
  /** Recent−earlier mean (index units) that counts as a meaningful climb. */
  dragRiseRate: 4.5,
  /** Very fast climb → strong ease immediately. */
  dragSurgeRate: 9,
  /** Hold Ease/Hold/Recover action at least this long (ms). */
  dragMinHoldMs: 1400,
} as const;

export type CoachingThresholds = typeof COACHING_THRESHOLDS;
