/**
 * dailyAssignmentEngine.js - Variable Daily Game Assignment Engine (2–5 games/day)
 *
 * Clinical Objective:
 * Assigns a severity-scaled number of games per day (2–5) across prioritised
 * cognitive domains, ensuring a warmup → target → stretch difficulty curve.
 *
 * Domain Priority Order (used when count < 5):
 *   1. Memory (স্মৃতি)
 *   2. Attention (মনোযোগ)
 *   3. Reasoning/Executive Function (যুক্তি আৰু কাৰ্যপ্ৰণালী)
 *   4. Visual Reasoning (দৃশ্যমান বিশ্লেষণ)
 *   5. Emotional Cognition (ভাৱ আৰু অনুভূতি)
 *
 * Features:
 * - Severity-scaled game count: severe→2, moderate→3, mild→5 (via resolveDailyGameCount).
 * - Deterministic day-based rotation so consecutive days explore distinct games.
 * - Per-session difficulty curve: warmup rung below base level, stepping up by 1 per game.
 * - gameHistory-aware selection to avoid recent repeats within same domain.
 */

import { GAMES_CONFIG } from '../data/gamesConfig.js';

export const COGNITIVE_DOMAINS = [
  'Memory',
  'Attention',
  'Reasoning/Executive Function',
  'Visual Reasoning',
  'Emotional Cognition'
];

export const TIER_DESCRIPTIONS = {
  1: { tier: 1, name: 'High Scaffolding', focus: 'Audio cues, larger touch targets, minimal choices' },
  2: { tier: 2, name: 'Standard Cognitive Exercise', focus: 'Balanced multi-option recall, voice prompts' },
  3: { tier: 3, name: 'Advanced Challenge', focus: 'Complex sequences, full village path recall' }
};

/**
 * Resolves the starting difficulty tier for a patient
 * Priority: explicit tier > starting_difficulty_tier > startingTier > clinical status > default (1)
 */
export function resolvePatientStartingTier(patientProfile = {}, explicitTier = null) {
  if (explicitTier && [1, 2, 3].includes(Number(explicitTier))) {
    return Number(explicitTier);
  }
  if (patientProfile?.starting_difficulty_tier && [1, 2, 3].includes(Number(patientProfile.starting_difficulty_tier))) {
    return Number(patientProfile.starting_difficulty_tier);
  }
  if (patientProfile?.startingTier && [1, 2, 3].includes(Number(patientProfile.startingTier))) {
    return Number(patientProfile.startingTier);
  }
  if (patientProfile?.status === 'critical') return 1;
  if (patientProfile?.status === 'attention') return 2;
  if (patientProfile?.status === 'stable') return 3;
  return 1;
}

// =============================================================================
// TODO: SEVERITY SCALING — REPLACE THIS ENTIRE BLOCK WHEN dementia_stage LANDS
//
// Once Sharvesh's patient_credentials / dementia_stage enum migration is live,
// delete resolveDailyGameCount() below and replace it with a single call to the
// real dementia_stage value from the DB (severe→2, moderate→3, mild→5).
//
// Current fallback priority chain (most → least reliable):
//   1. patientProfile.dailyCap          — explicit numeric override (2–5)
//   2. patientProfile.dementia_stage    — future DB enum (not live yet)
//      or patientProfile.stage string  — "severe"→2, "moderate"→3, "mild"→5
//   3. patientProfile.masteryScore      — <35→2, 35–60→3, 60–80→4, ≥80→5
//   4. patientProfile.status string     — "critical"→2, "attention"→3, "stable"→5
//   5. Default fallback                 — 3 games
//
// NOTE on "minimum 3 levels" for SEVERE (2-game) sessions:
//   Severe patients get 2 games/day spanning Level 1 (warmup) + Level 2 (target).
//   This only covers 2 distinct difficulty levels, not 3.  The 3-level rule is
//   intentionally waived for severe sessions — forcing Level 1 → Level 3 in a
//   2-game session skips the scaffold bridge, which is clinically contraindicated.
//   REVISIT once rolling session-history infrastructure is in place.
// =============================================================================

/**
 * Resolves the number of games a patient should play today (2–5),
 * scaled by severity indicators.
 *
 * @param {Object} patientProfile
 * @returns {number} integer in range [2, 5]
 */
export function resolveDailyGameCount(patientProfile = {}) {
  // Null/undefined guard — fall through to default
  if (!patientProfile) return 3;

  // 1. Explicit numeric cap wins (set by caregiver or preset)
  if (typeof patientProfile.dailyCap === 'number') {
    return Math.min(5, Math.max(2, patientProfile.dailyCap));
  }

  // 2. dementia_stage field (future DB column) or stage string
  const rawStage = (patientProfile.dementia_stage || patientProfile.stage || '').toLowerCase();
  if (rawStage.includes('severe') || rawStage.includes('late')) return 2;
  if (rawStage.includes('moderate') || rawStage.includes('middle')) return 3;
  if (rawStage.includes('mild') || rawStage.includes('early')) return 5;

  // 3. masteryScore proxy (0–100 → 1–10 levels, mapped to 2–5 games)
  if (typeof patientProfile.masteryScore === 'number') {
    const ms = patientProfile.masteryScore;
    if (ms < 35) return 2;
    if (ms < 60) return 3;
    if (ms < 80) return 4;
    return 5;
  }

  // 4. Clinical status string fallback
  if (patientProfile.status === 'critical') return 2;
  if (patientProfile.status === 'attention') return 3;
  if (patientProfile.status === 'stable') return 5;

  // 5. Safe clinical floor
  return 3;
}
// =============================================================================
// END TODO BLOCK
// =============================================================================

/**
 * Returns a session difficulty curve for a given number of games assigned today.
 * Index 0 = warmup (one rung below base), last index = stretch.
 *
 * Examples:
 *   2 games, base level 2: [1, 2]
 *   3 games, base level 5: [4, 5, 6]
 *   5 games, base level 7: [6, 7, 8, 9, 10]
 *
 * Levels are clamped to [1, 10].
 *
 * @param {number} gameCount  Total assigned games today (2–5)
 * @param {number} baseLevel  Patient's current difficulty level (1–10)
 * @returns {number[]} Array of levels, length === gameCount
 */
export function buildSessionDifficultyCurve(gameCount, baseLevel) {
  const clamp = (v) => Math.min(10, Math.max(1, v));
  const count = Math.min(5, Math.max(2, gameCount));
  const base = clamp(baseLevel);

  // Warmup starts one rung below base; subsequent rungs step up by 1
  const warmup = clamp(base - 1);
  const levels = [warmup];
  for (let i = 1; i < count; i++) {
    levels.push(clamp(warmup + i));
  }
  return levels;
}

/**
 * Deterministic integer hash from string
 */
function hashString(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

/**
 * Returns integer day index since Unix epoch
 */
function getDayIndex(dateInput) {
  const d = dateInput instanceof Date ? dateInput : new Date(dateInput);
  if (isNaN(d.getTime())) return 0;
  return Math.floor(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()) / (24 * 60 * 60 * 1000));
}

/**
 * Auto-assigns 2–5 games across cognitive domains, scaled by severity.
 * Domain priority order (when count < 5):
 *   Memory → Attention → Reasoning/EF → Visual Reasoning → Emotional Cognition
 *
 * @param {Object} options
 * @param {Object} [options.patientProfile] - Patient profile object
 * @param {number} [options.tier] - Explicit tier override (1, 2, or 3)
 * @param {Array} [options.gamesConfig] - Master games catalog (defaults to GAMES_CONFIG)
 * @param {Date|string} [options.date] - Date for daily rotation (defaults to now)
 * @param {Array<string>} [options.gameHistory] - Array of recently played game IDs (most recent first)
 * @returns {Array} Array of game objects (2–5), enriched with assignedTier, domain, assignedDate, and sessionLevel
 */
export function assignDailyGames({
  patientProfile = {},
  tier = null,
  gamesConfig = GAMES_CONFIG,
  date = new Date(),
  gameHistory = []
} = {}) {
  const resolvedTier = resolvePatientStartingTier(patientProfile, tier);
  const dailyCount = resolveDailyGameCount(patientProfile);
  const dayIdx = getDayIndex(date);
  const patientSeed = patientProfile?.id ? hashString(String(patientProfile.id)) : 0;
  const dateStr = (date instanceof Date ? date : new Date(date)).toISOString().split('T')[0];

  // Resolve base level for difficulty curve (masteryScore → level 1–10)
  const baseLevel = patientProfile?.masteryScore
    ? Math.min(10, Math.max(1, Math.ceil(patientProfile.masteryScore / 10)))
    : resolvedTier === 3 ? 8 : resolvedTier === 2 ? 5 : 2;

  // Filter eligible cognitive domains based on patient's activeCognitiveDomains (if configured by ASHA)
  const allowedDomains = Array.isArray(patientProfile?.activeCognitiveDomains) && patientProfile.activeCognitiveDomains.length > 0
    ? COGNITIVE_DOMAINS.filter(d => patientProfile.activeCognitiveDomains.includes(d))
    : COGNITIVE_DOMAINS;

  // Slice allowed domain list to dailyCount using priority order
  const activeDomains = allowedDomains.slice(0, dailyCount);

  // Sizing difficulty curve to the number of active games (warmup -> stretch)
  const sessionLevels = buildSessionDifficultyCurve(activeDomains.length, baseLevel);

  const assignedGames = [];

  activeDomains.forEach((domain, domainIndex) => {
    const domainCandidates = gamesConfig.filter((g) => g.category === domain);

    if (domainCandidates.length === 0) return;

    let selectedGame = null;

    if (domainCandidates.length === 1) {
      selectedGame = domainCandidates[0];
    } else {
      // Rotation index based on day index, domain offset, and patient seed
      const rawOffset = (dayIdx + domainIndex * 3 + (patientSeed % 7)) % domainCandidates.length;

      // Check if candidate was recently played according to gameHistory
      if (gameHistory && gameHistory.length > 0) {
        let bestCandidate = domainCandidates[rawOffset];
        let bestHistoryIndex = -1;

        for (let i = 0; i < domainCandidates.length; i++) {
          const candidate = domainCandidates[(rawOffset + i) % domainCandidates.length];
          const histPos = gameHistory.indexOf(candidate.id);
          if (histPos === -1) {
            // Not in recent history at all
            bestCandidate = candidate;
            break;
          } else if (histPos > bestHistoryIndex) {
            bestHistoryIndex = histPos;
            bestCandidate = candidate;
          }
        }
        selectedGame = bestCandidate;
      } else {
        selectedGame = domainCandidates[rawOffset];
      }
    }

    assignedGames.push({
      ...selectedGame,
      assignedTier: resolvedTier,
      startingDifficultyTier: resolvedTier,
      domain,
      assignedDate: dateStr,
      tierMetadata: TIER_DESCRIPTIONS[resolvedTier] || TIER_DESCRIPTIONS[1],
      sessionLevel: sessionLevels[domainIndex]
    });
  });

  return assignedGames;
}
