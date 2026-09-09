import { describe, it, expect } from 'vitest';
import {
  getDifficultyParams,
  GAME_DIFFICULTY_ENDPOINTS,
  GLOBAL_MIN_TIMING_MS,
  Multiplier,
  getDifficultyMultiplier,
  calculateLevelFromScore
} from '../../src/engine/difficultyScaling.js';

describe('Shared Difficulty Scaling Engine (10 Levels)', () => {
  it('contains endpoints for all 15 games', () => {
    const expectedGames = [
      'grandmas-shopping-list',
      'festival-memory-match',
      'daily-routine-recall',
      'shell-memory-trail',
      'remember-the-story',
      'whose-morning-is-it',
      'find-the-difference',
      'tea-garden-detective',
      'care-for-companion',
      'day-in-my-village',
      'finish-grandmas-weave',
      'memory-map-home',
      'pack-village-basket',
      'what-belongs-here',
      'whose-emotion'
    ];

    expectedGames.forEach((id) => {
      expect(GAME_DIFFICULTY_ENDPOINTS[id]).toBeDefined();
      expect(GAME_DIFFICULTY_ENDPOINTS[id].level1).toBeDefined();
      expect(GAME_DIFFICULTY_ENDPOINTS[id].level10).toBeDefined();
    });
  });

  it('implements exact exponential scaling Multiplier(L) = Math.pow(1.08, level - 1)', () => {
    expect(Multiplier(1)).toBe(1);
    expect(Multiplier(2)).toBeCloseTo(1.08, 5);
    expect(Multiplier(5)).toBeCloseTo(Math.pow(1.08, 4), 5);
    expect(Multiplier(10)).toBeCloseTo(Math.pow(1.08, 9), 5);
    expect(getDifficultyMultiplier(1)).toBe(1);
    expect(getDifficultyMultiplier(10)).toBeCloseTo(Math.pow(1.08, 9), 5);
  });

  it('enforces global 2000ms minimum floor on timing fields across all games', () => {
    Object.keys(GAME_DIFFICULTY_ENDPOINTS).forEach((gameId) => {
      for (let lvl = 1; lvl <= 10; lvl++) {
        const params = getDifficultyParams(gameId, lvl);
        expect(params.previewTimeMs).toBeGreaterThanOrEqual(GLOBAL_MIN_TIMING_MS);
      }
    });
  });

  it('guarantees whose-morning-is-it never drops below 2400ms previewTimeMs', () => {
    for (let lvl = 1; lvl <= 10; lvl++) {
      const params = getDifficultyParams('whose-morning-is-it', lvl);
      expect(params.previewTimeMs).toBeGreaterThanOrEqual(2400);
    }
    const lvl10 = getDifficultyParams('whose-morning-is-it', 10);
    expect(lvl10.previewTimeMs).toBe(2400);
  });

  it('scales base parameters and applies inverse time scaling across levels 1 to 10 for Grandmas Shopping List', () => {
    const l1 = getDifficultyParams('grandmas-shopping-list', 1);
    const l5 = getDifficultyParams('grandmas-shopping-list', 5);
    const l10 = getDifficultyParams('grandmas-shopping-list', 10);

    // Level 1: easiest
    expect(l1.itemCount).toBe(2);
    expect(l1.distractorCount).toBe(2);
    expect(l1.previewTimeMs).toBe(10000);
    expect(l1.distractorSimilarity).toBe('low');

    // Level 5: middle (+8% exponential scaling)
    expect(l5.itemCount).toBe(4);
    expect(l5.distractorCount).toBe(4);
    expect(l5.previewTimeMs).toBe(7350); // 10000 / 1.08^4 = 7350
    expect(l5.distractorSimilarity).toBe('medium');

    // Level 10: hardest
    expect(l10.itemCount).toBe(6);
    expect(l10.distractorCount).toBe(6);
    expect(l10.previewTimeMs).toBe(5000);
    expect(l10.distractorSimilarity).toBe('high');
  });

  it('categorizes distractorSimilarity into low (1-3), medium (4-7), high (8-10)', () => {
    expect(getDifficultyParams('festival-memory-match', 1).distractorSimilarity).toBe('low');
    expect(getDifficultyParams('festival-memory-match', 3).distractorSimilarity).toBe('low');
    expect(getDifficultyParams('festival-memory-match', 4).distractorSimilarity).toBe('medium');
    expect(getDifficultyParams('festival-memory-match', 7).distractorSimilarity).toBe('medium');
    expect(getDifficultyParams('festival-memory-match', 8).distractorSimilarity).toBe('high');
    expect(getDifficultyParams('festival-memory-match', 10).distractorSimilarity).toBe('high');
  });

  it('calculates level progression via calculateLevelFromScore (+1 on 3 wins, -1 on 2 losses)', () => {
    // 3 consecutive wins -> +1 level
    expect(calculateLevelFromScore(5, 3, 0)).toBe(6);
    expect(calculateLevelFromScore(10, 3, 0)).toBe(10); // clamped at 10

    // 2 consecutive losses -> -1 level
    expect(calculateLevelFromScore(5, 0, 2)).toBe(4);
    expect(calculateLevelFromScore(1, 0, 2)).toBe(1); // clamped at 1

    // Streaks not met -> unchanged
    expect(calculateLevelFromScore(5, 2, 1)).toBe(5);

    // Optional accuracy checks (>=80% for wins, <50% for losses)
    expect(calculateLevelFromScore(5, 3, 0, 85)).toBe(6);
    expect(calculateLevelFromScore(5, 3, 0, 75)).toBe(5);
    expect(calculateLevelFromScore(5, 0, 2, 40)).toBe(4);
    expect(calculateLevelFromScore(5, 0, 2, 60)).toBe(5);
  });
});
