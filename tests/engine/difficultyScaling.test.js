import { describe, it, expect } from 'vitest';
import {
  getDifficultyParams,
  GAME_DIFFICULTY_ENDPOINTS,
  GLOBAL_MIN_TIMING_MS
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
      'care-for-your-companion',
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

  it('interpolates linearly across levels 1 to 10 for Grandmas Shopping List', () => {
    const l1 = getDifficultyParams('grandmas-shopping-list', 1);
    const l5 = getDifficultyParams('grandmas-shopping-list', 5);
    const l10 = getDifficultyParams('grandmas-shopping-list', 10);

    // Level 1: easiest
    expect(l1.itemCount).toBe(2);
    expect(l1.distractorCount).toBe(2);
    expect(l1.previewTimeMs).toBe(10000);
    expect(l1.distractorSimilarity).toBe('low');

    // Level 5: middle
    expect(l5.itemCount).toBe(4);
    expect(l5.distractorCount).toBe(4);
    expect(l5.previewTimeMs).toBe(7778); // 10000 - 4/9 * 5000 = 7778
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
});
