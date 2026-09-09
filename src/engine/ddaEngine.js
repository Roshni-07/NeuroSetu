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

/**
 * Compute continuous 1-10 difficulty level from 0-100 masteryScore
 * Formula: getLevel(masteryScore) => Math.min(10, Math.max(1, Math.ceil(masteryScore / 10)))
 * 
 * @param {number} masteryScore - Integer 0-100 (defaults to 50)
 * @returns {number} Level from 1 to 10
 */
export function getLevel(masteryScore = 50) {
  const safeScore = Number.isFinite(Number(masteryScore)) ? Number(masteryScore) : 50;
  return Math.min(10, Math.max(1, Math.ceil(safeScore / 10)));
}

/**
 * Pure function to evaluate and update masteryScore based on gameplay events.
 * 
 * Promotion: 3 consecutive correct answers with response time under 10s -> masteryScore += 8 (cap at 100)
 * Demotion: 1 timeout (>15s) OR 2 consecutive errors -> masteryScore -= 12 (floor at 0)
 * 
 * @param {number|Object} currentScore - Current masteryScore (0-100) or state object { score, consecutiveFast, consecutiveErrors }
 * @param {'correct_fast'|'correct_slow'|'error'|'timeout'} event - Turn outcome event
 * @param {Object} [context] - Optional streak context when currentScore is a number
 * @param {number} [context.consecutiveFast] - Count of consecutive fast correct turns (<10s)
 * @param {number} [context.consecutiveErrors] - Count of consecutive error turns
 * @returns {number|Object} Updated score (or updated state object if object was provided)
 */
export function updateMasteryScore(currentScore, event, context = {}) {
  const isObjectState = typeof currentScore === 'object' && currentScore !== null;
  const rawScore = isObjectState ? currentScore.score : currentScore;
  const score = Number.isFinite(Number(rawScore)) ? Number(rawScore) : 50;

  let consecutiveFast = isObjectState
    ? (currentScore.consecutiveFast || 0)
    : (context.consecutiveFast ?? (event === 'correct_fast' ? 3 : 0));

  let consecutiveErrors = isObjectState
    ? (currentScore.consecutiveErrors || 0)
    : (context.consecutiveErrors ?? (event === 'error' ? 2 : 0));

  let newScore = score;

  switch (event) {
    case 'correct_fast': {
      if (isObjectState) {
        consecutiveFast += 1;
        consecutiveErrors = 0;
        if (consecutiveFast >= 3) {
          newScore = Math.min(100, score + 8);
          consecutiveFast = 0;
        }
      } else {
        if (consecutiveFast >= 3) {
          newScore = Math.min(100, score + 8);
        }
      }
      break;
    }
    case 'correct_slow': {
      consecutiveFast = 0;
      consecutiveErrors = 0;
      break;
    }
    case 'error': {
      if (isObjectState) {
        consecutiveErrors += 1;
        consecutiveFast = 0;
        if (consecutiveErrors >= 2) {
          newScore = Math.max(0, score - 12);
          consecutiveErrors = 0;
        }
      } else {
        if (consecutiveErrors >= 2) {
          newScore = Math.max(0, score - 12);
        }
      }
      break;
    }
    case 'timeout': {
      consecutiveFast = 0;
      newScore = Math.max(0, score - 12);
      break;
    }
    default:
      break;
  }

  if (isObjectState) {
    return {
      score: newScore,
      level: getLevel(newScore),
      consecutiveFast,
      consecutiveErrors
    };
  }

  return newScore;
}

export {
  assignDailyGames,
  COGNITIVE_DOMAINS,
  FAMILY_GAMES,
  resolveDailyFamilyGame,
  resolvePatientStartingTier,
  resolveDailyGameCount,
  buildSessionDifficultyCurve
} from './dailyAssignmentEngine.js';

