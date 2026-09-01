/**
 * ddaEngine.js - Rule-Based Dynamic Difficulty Adjustment Engine
 * Spec: Silently reduces difficulty after 2 consecutive errors OR >15s response latency.
 * Promotes difficulty after 3 consecutive fast, correct answers.
 * Guarantees zero punitive feedback per errorless-learning clinical requirements.
 */

export const DIFFICULTY_TIERS = {
  TIER_1: 1, // High scaffolding: 2 large options, audio auto-play, prominent visual hints
  TIER_2: 2, // Standard: 3-4 options, voice prompt, standard latency window
  TIER_3: 3  // Advanced: 4+ options, nuanced cultural recall, minimal prompt repetition
};

export const DDA_CONFIG = {
  MIN_TIER: 1,
  MAX_TIER: 3,
  LATENCY_THRESHOLD_MS: 15000, // 15 seconds trigger for difficulty reduction
  CONSECUTIVE_ERRORS_THRESHOLD: 2, // 2 consecutive errors trigger
  SUCCESS_STREAK_THRESHOLD: 3, // 3 consecutive fast successes for promotion
  FAST_SUCCESS_LATENCY_MAX_MS: 8000 // Fast response threshold for promotion
};

/**
 * Evaluate and determine the next difficulty tier based on response metrics
 * 
 * @param {number} currentTier - Current difficulty tier (1, 2, or 3)
 * @param {Object} metrics - Performance metrics of the turn
 * @param {number} metrics.consecutiveErrors - Current tally of consecutive errors
 * @param {number} metrics.latencyMs - Response latency in milliseconds
 * @param {number} metrics.consecutiveSuccesses - Current tally of consecutive successes
 * @returns {Object} DDA decision object containing new tier, action taken, and reason
 */
export function evaluateDifficulty(currentTier = 1, {
  consecutiveErrors = 0,
  latencyMs = 0,
  consecutiveSuccesses = 0
} = {}) {
  const safeTier = Math.min(Math.max(Number(currentTier) || 1, DDA_CONFIG.MIN_TIER), DDA_CONFIG.MAX_TIER);
  const safeLatency = Math.max(0, Number(latencyMs) || 0);
  const safeErrors = Math.max(0, Number(consecutiveErrors) || 0);
  const safeSuccesses = Math.max(0, Number(consecutiveSuccesses) || 0);

  // Condition A: Difficulty Reduction Trigger (2 consecutive errors OR >15s response latency)
  const isErrorTrigger = safeErrors >= DDA_CONFIG.CONSECUTIVE_ERRORS_THRESHOLD;
  const isLatencyTrigger = safeLatency > DDA_CONFIG.LATENCY_THRESHOLD_MS;

  if (isErrorTrigger || isLatencyTrigger) {
    const reasons = [];
    if (isErrorTrigger) reasons.push(`${safeErrors} consecutive errors`);
    if (isLatencyTrigger) reasons.push(`response latency ${safeLatency}ms > 15000ms`);

    if (safeTier > DDA_CONFIG.MIN_TIER) {
      return {
        previousTier: safeTier,
        newTier: safeTier - 1,
        action: 'decreased',
        reason: reasons.join(' and '),
        alertTriggered: true
      };
    } else {
      // Already at floor Tier 1; maintain floor tier and reinforce gentle scaffolding
      return {
        previousTier: safeTier,
        newTier: DDA_CONFIG.MIN_TIER,
        action: 'maintained_at_minimum',
        reason: `${reasons.join(' and ')} (at minimum tier floor)`,
        alertTriggered: true
      };
    }
  }

  // Condition B: Difficulty Promotion Trigger (3 consecutive fast, correct turns)
  if (safeSuccesses >= DDA_CONFIG.SUCCESS_STREAK_THRESHOLD && safeLatency <= DDA_CONFIG.FAST_SUCCESS_LATENCY_MAX_MS) {
    if (safeTier < DDA_CONFIG.MAX_TIER) {
      return {
        previousTier: safeTier,
        newTier: safeTier + 1,
        action: 'increased',
        reason: `${safeSuccesses} consecutive fast correct answers`,
        alertTriggered: false
      };
    } else {
      return {
        previousTier: safeTier,
        newTier: DDA_CONFIG.MAX_TIER,
        action: 'maintained_at_maximum',
        reason: 'Maximum difficulty ceiling reached',
        alertTriggered: false
      };
    }
  }

  // Condition C: Stable / Maintained
  return {
    previousTier: safeTier,
    newTier: safeTier,
    action: 'maintained',
    reason: 'Performance within expected cognitive window',
    alertTriggered: false
  };
}
