/**
 * difficultyScaling.js - 10-Level Shared Deterministic Difficulty Scaling Engine
 * 
 * Implements the deterministic 10-level +8% exponential difficulty scaling formula:
 *   Multiplier(L) = Math.pow(1.08, level - 1)  // where level ranges from 1 to 10
 * 
 * Guarantees & Features:
 * 1. Exponential Scaling: Base parameters (itemCount, distractorCount, speed) scale
 *    proportionally with Multiplier(L).
 * 2. Inverse Time Scaling: Time limits / preview times scale inversely:
 *      ScaledTime = BaseTime / Multiplier(L)
 * 3. Hard Safety Floors:
 *    - Global minimum response/preview time floor of 2,000ms across all cognitive tasks.
 *    - Hard floor of 2,400ms for 'whose-morning-is-it'.
 * 4. Progression Logic:
 *    - calculateLevelFromScore: +1 level after 3 consecutive wins (accuracy >= 80%),
 *      -1 level after 2 consecutive losses (accuracy < 50%).
 */

export const GLOBAL_MIN_TIMING_MS = 2000;

export const GAME_DIFFICULTY_ENDPOINTS = {
  // Batch 1 Games
  'grandmas-shopping-list': {
    level1: { itemCount: 2, distractorCount: 2, previewTimeMs: 10000, distractorSimilarity: 'low' },
    level10: { itemCount: 6, distractorCount: 6, previewTimeMs: 5000, distractorSimilarity: 'high' }
  },
  'festival-memory-match': {
    level1: { itemCount: 2, distractorCount: 2, previewTimeMs: 2500, distractorSimilarity: 'low' },
    level10: { itemCount: 6, distractorCount: 6, previewTimeMs: 2000, distractorSimilarity: 'high' }
  },
  'daily-routine-recall': {
    level1: { itemCount: 2, distractorCount: 0, previewTimeMs: 10000, distractorSimilarity: 'low' },
    level10: { itemCount: 6, distractorCount: 2, previewTimeMs: 4000, distractorSimilarity: 'high' }
  },
  'shell-memory-trail': {
    level1: { itemCount: 3, distractorCount: 2, previewTimeMs: 3500, distractorSimilarity: 'low' },
    level10: { itemCount: 6, distractorCount: 5, previewTimeMs: 2000, distractorSimilarity: 'high' }
  },

  // Batch 2 Games
  'remember-the-story': {
    level1: { itemCount: 2, distractorCount: 1, previewTimeMs: 12000, distractorSimilarity: 'low' },
    level10: { itemCount: 5, distractorCount: 3, previewTimeMs: 4000, distractorSimilarity: 'high' }
  },
  'whose-morning-is-it': {
    level1: { itemCount: 2, distractorCount: 1, previewTimeMs: 3600, distractorSimilarity: 'low' },
    level10: { itemCount: 6, distractorCount: 4, previewTimeMs: 2400, distractorSimilarity: 'high' }
  },
  'find-the-difference': {
    level1: { itemCount: 2, distractorCount: 0, previewTimeMs: 15000, distractorSimilarity: 'low' },
    level10: { itemCount: 8, distractorCount: 0, previewTimeMs: 5000, distractorSimilarity: 'high' }
  },
  'tea-garden-detective': {
    level1: { itemCount: 4, distractorCount: 2, previewTimeMs: 3500, distractorSimilarity: 'low' },
    level10: { itemCount: 12, distractorCount: 4, previewTimeMs: 2000, distractorSimilarity: 'high' }
  },

  // Batch 3 Games
  'care-for-companion': {
    level1: { itemCount: 2, distractorCount: 1, previewTimeMs: 12000, distractorSimilarity: 'low' },
    level10: { itemCount: 5, distractorCount: 4, previewTimeMs: 5000, distractorSimilarity: 'high' }
  },
  'care-for-companion': {
    level1: { itemCount: 2, distractorCount: 1, previewTimeMs: 12000, distractorSimilarity: 'low' },
    level10: { itemCount: 5, distractorCount: 4, previewTimeMs: 5000, distractorSimilarity: 'high' }
  },
  'day-in-my-village': {
    level1: { itemCount: 2, distractorCount: 1, previewTimeMs: 12000, distractorSimilarity: 'low' },
    level10: { itemCount: 5, distractorCount: 3, previewTimeMs: 4000, distractorSimilarity: 'high' }
  },
  'finish-grandmas-weave': {
    level1: { itemCount: 1, distractorCount: 1, previewTimeMs: 12000, distractorSimilarity: 'low' },
    level10: { itemCount: 5, distractorCount: 4, previewTimeMs: 4000, distractorSimilarity: 'high' }
  },

  // Batch 4 Games
  'memory-map-home': {
    level1: { itemCount: 2, distractorCount: 2, previewTimeMs: 7000, distractorSimilarity: 'low' },
    level10: { itemCount: 6, distractorCount: 4, previewTimeMs: 2500, distractorSimilarity: 'high' }
  },
  'pack-village-basket': {
    level1: { itemCount: 2, distractorCount: 1, previewTimeMs: 10000, distractorSimilarity: 'low' },
    level10: { itemCount: 6, distractorCount: 6, previewTimeMs: 4000, distractorSimilarity: 'high' }
  },
  'what-belongs-here': {
    level1: { itemCount: 3, distractorCount: 0, previewTimeMs: 10000, distractorSimilarity: 'low' },
    level10: { itemCount: 12, distractorCount: 0, previewTimeMs: 4000, distractorSimilarity: 'high' }
  },
  'whose-emotion': {
    level1: { itemCount: 2, distractorCount: 1, previewTimeMs: 10000, distractorSimilarity: 'low' },
    level10: { itemCount: 6, distractorCount: 3, previewTimeMs: 4000, distractorSimilarity: 'high' }
  }
};

// Aliases with underscores for flexible lookup
Object.keys(GAME_DIFFICULTY_ENDPOINTS).forEach((k) => {
  const underscored = k.replace(/-/g, '_');
  if (underscored !== k) {
    GAME_DIFFICULTY_ENDPOINTS[underscored] = GAME_DIFFICULTY_ENDPOINTS[k];
  }
});

/**
 * Exponential scaling helper:
 * Multiplier(L) = Math.pow(1.08, level - 1)  // where level ranges from 1 to 10
 * 
 * @param {number} level - Difficulty level between 1 and 10
 * @returns {number} Exponential multiplier (1.0 at level 1 to ~1.999 at level 10)
 */
export function Multiplier(level) {
  const safeLevel = Math.min(10, Math.max(1, Math.round(Number(level) || 1)));
  return Math.pow(1.08, safeLevel - 1);
}

// Aliases for developer ergonomics
export const getDifficultyMultiplier = Multiplier;
export const calculateMultiplier = Multiplier;

/**
 * Compute difficulty parameters for a given level using the deterministic +8% formula.
 * 
 * Base parameters (itemCount, distractorCount, speed) scale using Multiplier(L).
 * Time limits / preview times scale inversely: ScaledTime = BaseTime / Multiplier(L).
 * 
 * @param {string|number} gameIdOrLevel - Game ID string or numeric level (1-10)
 * @param {number|Object|string} [levelOrEndpoints] - Level number, custom endpoint object, or game ID
 * @returns {Object} Difficulty parameters { level, multiplier, itemCount, distractorCount, previewTimeMs, distractorSimilarity, speed? }
 */
export function getDifficultyParams(gameIdOrLevel, levelOrEndpoints) {
  let level = 5;
  let endpoints = null;
  let gameId = '';

  if (typeof gameIdOrLevel === 'string') {
    gameId = gameIdOrLevel.toLowerCase().trim();
    endpoints = GAME_DIFFICULTY_ENDPOINTS[gameId] || GAME_DIFFICULTY_ENDPOINTS[gameId.replace(/_/g, '-')];
    level = typeof levelOrEndpoints === 'number' ? levelOrEndpoints : 5;
  } else if (typeof gameIdOrLevel === 'number') {
    level = gameIdOrLevel;
    if (typeof levelOrEndpoints === 'string') {
      gameId = levelOrEndpoints.toLowerCase().trim();
      endpoints = GAME_DIFFICULTY_ENDPOINTS[gameId] || GAME_DIFFICULTY_ENDPOINTS[gameId.replace(/_/g, '-')];
    } else if (typeof levelOrEndpoints === 'object' && levelOrEndpoints !== null) {
      endpoints = levelOrEndpoints;
    }
  }

  // Fallback default endpoints if none matched
  if (!endpoints || (!endpoints.level1 && !endpoints.base)) {
    endpoints = {
      level1: { itemCount: 2, distractorCount: 2, previewTimeMs: 8000, distractorSimilarity: 'low' },
      level10: { itemCount: 8, distractorCount: 8, previewTimeMs: 2500, distractorSimilarity: 'high' }
    };
  }

  const safeLevel = Math.min(10, Math.max(1, Math.round(Number(level) || 5)));
  const multiplier = Multiplier(safeLevel);

  const base = endpoints.base || endpoints.level1 || {};
  const maxTarget = endpoints.level10 || null;

  // Normalized progress: 0 at level 1, 1 at level 10
  const progress = (safeLevel - 1) / 9;

  // 1. Scale item count
  let itemCount;
  if (maxTarget && typeof maxTarget.itemCount === 'number') {
    itemCount = Math.round(base.itemCount + progress * (maxTarget.itemCount - base.itemCount));
  } else if (typeof base.itemCount === 'number') {
    itemCount = Math.round(base.itemCount * multiplier);
  } else {
    itemCount = 2;
  }

  // 2. Scale distractor count
  let distractorCount;
  if (maxTarget && typeof maxTarget.distractorCount === 'number') {
    distractorCount = Math.round(base.distractorCount + progress * (maxTarget.distractorCount - base.distractorCount));
  } else if (typeof base.distractorCount === 'number') {
    distractorCount = Math.round(base.distractorCount * multiplier);
  } else {
    distractorCount = 0;
  }

  // 3. Optional speed scaling
  let speed;
  if (typeof base.speed === 'number') {
    speed = Number((base.speed * multiplier).toFixed(2));
  }

  // 4. Inverse time scaling: ScaledTime = BaseTime / Multiplier(L)
  const baseTime = base.previewTimeMs || base.timeLimitMs || 8000;
  let rawPreviewTime;
  if (safeLevel === 10 && maxTarget?.previewTimeMs) {
    rawPreviewTime = maxTarget.previewTimeMs;
  } else if (safeLevel === 1 && base.previewTimeMs) {
    rawPreviewTime = base.previewTimeMs;
  } else {
    rawPreviewTime = Math.round(baseTime / multiplier);
  }

  // Preserved Safety Floors:
  // - Hard floor of 2,400ms for 'whose-morning-is-it'
  // - Global minimum floor of 2,000ms for all other games
  const isWhoseMorning = gameId.includes('whose-morning') || gameId.includes('whose_morning');
  const minFloor = isWhoseMorning ? 2400 : GLOBAL_MIN_TIMING_MS;
  const previewTimeMs = Math.max(minFloor, rawPreviewTime);

  // Distractor similarity tiering
  const distractorSimilarity = safeLevel <= 3 ? 'low' : safeLevel <= 7 ? 'medium' : 'high';

  const result = {
    level: safeLevel,
    multiplier,
    itemCount,
    distractorCount,
    previewTimeMs,
    distractorSimilarity
  };

  if (speed !== undefined) {
    result.speed = speed;
  }

  return result;
}

/**
 * Calculate the next difficulty level based on consecutive performance streaks.
 * 
 * Rules:
 * - +1 level after 3 consecutive wins (accuracy >= 80%)
 * - -1 level after 2 consecutive losses (accuracy < 50%)
 * - Clamped within levels 1 to 10
 * 
 * @param {number} currentLevel - Current difficulty level (1-10)
 * @param {number} consecutiveWins - Number of consecutive successful rounds
 * @param {number} consecutiveLosses - Number of consecutive unsuccessful rounds
 * @param {number} [accuracy] - Optional round accuracy score (0-100 or 0.0-1.0)
 * @returns {number} Updated difficulty level (1-10)
 */
export function calculateLevelFromScore(currentLevel, consecutiveWins = 0, consecutiveLosses = 0, accuracy = null) {
  const level = Math.min(10, Math.max(1, Math.round(Number(currentLevel) || 1)));
  const wins = Number(consecutiveWins) || 0;
  const losses = Number(consecutiveLosses) || 0;

  if (accuracy !== null && accuracy !== undefined) {
    const acc = accuracy <= 1 ? accuracy * 100 : accuracy;
    if (wins >= 3 && acc >= 80) {
      return Math.min(10, level + 1);
    }
    if (losses >= 2 && acc < 50) {
      return Math.max(1, level - 1);
    }
    return level;
  }

  if (wins >= 3) {
    return Math.min(10, level + 1);
  }
  if (losses >= 2) {
    return Math.max(1, level - 1);
  }
  return level;
}
