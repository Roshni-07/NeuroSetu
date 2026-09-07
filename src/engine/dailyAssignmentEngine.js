/**
 * dailyAssignmentEngine.js - Daily 5-Domain Game Auto-Assignment Engine
 * 
 * Clinical Objective:
 * Ensures every patient receives a balanced, neurocognitively complete daily regimen
 * covering all 5 core cognitive domains:
 * 1. Memory (স্মৃতি)
 * 2. Attention (মনোযোগ)
 * 3. Reasoning/Executive Function (যুক্তি আৰু কাৰ্যপ্ৰণালী)
 * 4. Visual Reasoning (দৃশ্যমান বিশ্লেষণ)
 * 5. Emotional Cognition (ভাৱ আৰু অনুভূতি)
 * 
 * Features:
 * - Deterministic rotation using date & patient identifier so consecutive days
 *   explore distinct games without repetitive fatigue.
 * - Seeds starting difficulty tier (1/2/3) from patient profile or clinical severity
 *   ('critical' -> Tier 1, 'attention' -> Tier 2, 'stable' -> Tier 3).
 * - Generates exactly one assigned game per domain (5 games total).
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
 * Auto-assigns exactly 5 games across the 5 cognitive domains
 * 
 * @param {Object} options
 * @param {Object} [options.patientProfile] - Patient profile object
 * @param {number} [options.tier] - Explicit tier override (1, 2, or 3)
 * @param {Array} [options.gamesConfig] - Master games catalog (defaults to GAMES_CONFIG)
 * @param {Date|string} [options.date] - Date for daily rotation (defaults to now)
 * @param {Array<string>} [options.gameHistory] - Array of recently played game IDs (most recent first)
 * @returns {Array} Array of 5 game objects, each enriched with assignedTier, domain, and targetDate
 */
export function assignDailyGames({
  patientProfile = {},
  tier = null,
  gamesConfig = GAMES_CONFIG,
  date = new Date(),
  gameHistory = []
} = {}) {
  const resolvedTier = resolvePatientStartingTier(patientProfile, tier);
  const dayIdx = getDayIndex(date);
  const patientSeed = patientProfile?.id ? hashString(String(patientProfile.id)) : 0;
  const dateStr = (date instanceof Date ? date : new Date(date)).toISOString().split('T')[0];

  const assignedGames = [];

  COGNITIVE_DOMAINS.forEach((domain, domainIndex) => {
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
      tierMetadata: TIER_DESCRIPTIONS[resolvedTier] || TIER_DESCRIPTIONS[1]
    });
  });

  return assignedGames;
}
