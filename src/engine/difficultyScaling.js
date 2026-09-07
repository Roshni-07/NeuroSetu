/**
 * difficultyScaling.js - 10-Level Shared Continuous Difficulty Scaling Engine
 * 
 * Provides linear interpolation between Level 1 (easiest) and Level 10 (hardest)
 * across item counts, distractor counts, preview/timing windows, and distractor similarity.
 * 
 * Guarantees:
 * 1. Global floor of 2000ms on all timing fields (prevents motor-speed failure in elderly dementia care).
 * 2. 'whose-morning-is-it' audio playback step never drops below 2400ms.
 * 3. Linear interpolation across levels 2-9 with deterministic rounding.
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
    level10: { itemCount: 4, distractorCount: 3, previewTimeMs: 4000, distractorSimilarity: 'high' }
  },
  'whose-morning-is-it': {
    level1: { itemCount: 2, distractorCount: 2, previewTimeMs: 3600, distractorSimilarity: 'low' },
    level10: { itemCount: 4, distractorCount: 4, previewTimeMs: 2400, distractorSimilarity: 'high' }
  },
  'find-the-difference': {
    level1: { itemCount: 2, distractorCount: 0, previewTimeMs: 12000, distractorSimilarity: 'low' },
    level10: { itemCount: 4, distractorCount: 0, previewTimeMs: 4000, distractorSimilarity: 'high' }
  },
  'tea-garden-detective': {
    level1: { itemCount: 4, distractorCount: 2, previewTimeMs: 3500, distractorSimilarity: 'low' },
    level10: { itemCount: 12, distractorCount: 4, previewTimeMs: 2000, distractorSimilarity: 'high' }
  },

  // Batch 3 Games
  'care-for-your-companion': {
    level1: { itemCount: 2, distractorCount: 1, previewTimeMs: 12000, distractorSimilarity: 'low' },
    level10: { itemCount: 4, distractorCount: 4, previewTimeMs: 5000, distractorSimilarity: 'high' }
  },
  'day-in-my-village': {
    level1: { itemCount: 2, distractorCount: 1, previewTimeMs: 10000, distractorSimilarity: 'low' },
    level10: { itemCount: 4, distractorCount: 3, previewTimeMs: 4000, distractorSimilarity: 'high' }
  },
  'finish-grandmas-weave': {
    level1: { itemCount: 1, distractorCount: 1, previewTimeMs: 12000, distractorSimilarity: 'low' },
    level10: { itemCount: 4, distractorCount: 4, previewTimeMs: 4000, distractorSimilarity: 'high' }
  },

  // Batch 4 Games
  'memory-map-home': {
    level1: { itemCount: 2, distractorCount: 2, previewTimeMs: 7000, distractorSimilarity: 'low' },
    level10: { itemCount: 6, distractorCount: 4, previewTimeMs: 2500, distractorSimilarity: 'high' }
  },
  'pack-village-basket': {
    level1: { itemCount: 2, distractorCount: 2, previewTimeMs: 10000, distractorSimilarity: 'low' },
    level10: { itemCount: 4, distractorCount: 4, previewTimeMs: 4000, distractorSimilarity: 'high' }
  },
  'what-belongs-here': {
    level1: { itemCount: 4, distractorCount: 0, previewTimeMs: 10000, distractorSimilarity: 'low' },
    level10: { itemCount: 9, distractorCount: 0, previewTimeMs: 4000, distractorSimilarity: 'high' }
  },
  'whose-emotion': {
    level1: { itemCount: 2, distractorCount: 1, previewTimeMs: 10000, distractorSimilarity: 'low' },
    level10: { itemCount: 3, distractorCount: 3, previewTimeMs: 4000, distractorSimilarity: 'high' }
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
 * Compute difficulty parameters for a given level and endpoint anchors.
 * 
 * @param {string|number} gameIdOrLevel - Game ID string or numeric level (1-10)
 * @param {number|Object|string} [levelOrEndpoints] - Level number, custom endpoint object, or game ID
 * @returns {Object} Difficulty parameters { level, itemCount, distractorCount, previewTimeMs, distractorSimilarity }
 */
export function getDifficultyParams(gameIdOrLevel, levelOrEndpoints) {
  let level = 5;
  let endpoints = null;

  if (typeof gameIdOrLevel === 'string') {
    const key = gameIdOrLevel.toLowerCase().trim();
    endpoints = GAME_DIFFICULTY_ENDPOINTS[key] || GAME_DIFFICULTY_ENDPOINTS[key.replace(/_/g, '-')];
    level = typeof levelOrEndpoints === 'number' ? levelOrEndpoints : 5;
  } else if (typeof gameIdOrLevel === 'number') {
    level = gameIdOrLevel;
    if (typeof levelOrEndpoints === 'string') {
      const key = levelOrEndpoints.toLowerCase().trim();
      endpoints = GAME_DIFFICULTY_ENDPOINTS[key] || GAME_DIFFICULTY_ENDPOINTS[key.replace(/_/g, '-')];
    } else if (typeof levelOrEndpoints === 'object' && levelOrEndpoints !== null) {
      endpoints = levelOrEndpoints;
    }
  }

  // Fallback default endpoints if none matched
  if (!endpoints || !endpoints.level1 || !endpoints.level10) {
    endpoints = {
      level1: { itemCount: 2, distractorCount: 2, previewTimeMs: 8000, distractorSimilarity: 'low' },
      level10: { itemCount: 8, distractorCount: 8, previewTimeMs: 2500, distractorSimilarity: 'high' }
    };
  }

  const safeLevel = Math.min(10, Math.max(1, Math.round(Number(level) || 5)));
  const t = (safeLevel - 1) / 9; // 0 at level 1, 1 at level 10

  const { level1, level10 } = endpoints;

  const itemCount = Math.round(level1.itemCount + t * (level10.itemCount - level1.itemCount));
  const distractorCount = Math.round(level1.distractorCount + t * (level10.distractorCount - level1.distractorCount));
  
  const rawPreviewTime = Math.round(level1.previewTimeMs + t * (level10.previewTimeMs - level1.previewTimeMs));
  const previewTimeMs = Math.max(GLOBAL_MIN_TIMING_MS, rawPreviewTime);

  const distractorSimilarity = safeLevel <= 3 ? 'low' : safeLevel <= 7 ? 'medium' : 'high';

  return {
    level: safeLevel,
    itemCount,
    distractorCount,
    previewTimeMs,
    distractorSimilarity
  };
}
