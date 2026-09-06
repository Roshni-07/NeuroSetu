import { describe, it, expect, beforeEach } from 'vitest';
import { getAllProgress, getGameProgress, saveGameScore, clearAllProgress } from '../src/utils/storage.js';
import { GAMES_CONFIG } from '../src/data/gamesConfig.js';
import { CATEGORIES } from '../src/components2/Hub.jsx';

describe('Cognitive Game Suite Storage & Config', () => {
  beforeEach(() => {
    clearAllProgress();
  });

  it('correctly tracks and updates game scores and completion in localStorage', () => {
    expect(getGameProgress('grandmas-shopping-list')).toBeNull();

    const saved = saveGameScore('grandmas-shopping-list', 85, { accuracy: 90 });
    expect(saved.completed).toBe(true);
    expect(saved.bestScore).toBe(85);
    expect(saved.timesPlayed).toBe(1);

    const record = getGameProgress('grandmas-shopping-list');
    expect(record).not.toBeNull();
    expect(record.completed).toBe(true);
    expect(record.bestScore).toBe(85);

    // Save higher score
    const updated = saveGameScore('grandmas-shopping-list', 95);
    expect(updated.bestScore).toBe(95);
    expect(updated.timesPlayed).toBe(2);

    // Save lower score, bestScore should remain 95
    const lower = saveGameScore('grandmas-shopping-list', 70);
    expect(lower.bestScore).toBe(95);
    expect(lower.timesPlayed).toBe(3);
  });

  it('contains exactly 15 games across the 5 specified cognitive categories', () => {
    expect(GAMES_CONFIG.length).toBe(15);

    const phase1Games = GAMES_CONFIG.filter((g) => g.phase === 1);
    const phase2Games = GAMES_CONFIG.filter((g) => g.phase === 2);

    expect(phase1Games.length).toBe(8);
    expect(phase2Games.length).toBe(7);

    // All 8 Phase 1 games must have executable components
    phase1Games.forEach((game) => {
      expect(game.component).toBeDefined();
      expect(typeof game.component).toBe('function');
      expect(game.instructions.length).toBeGreaterThan(0);
      expect(game.name.length).toBeGreaterThan(0);
      expect(game.icon.length).toBeGreaterThan(0);
    });

    // 5 Categories verification
    const categoryIds = CATEGORIES.map((c) => c.id);
    expect(categoryIds).toContain('Memory');
    expect(categoryIds).toContain('Attention');
    expect(categoryIds).toContain('Reasoning/Executive Function');
    expect(categoryIds).toContain('Visual Reasoning');
    expect(categoryIds).toContain('Emotional Cognition');

    GAMES_CONFIG.forEach((game) => {
      expect(categoryIds).toContain(game.category);
    });
  });

  it('has all 8 Phase 1 games properly defined', () => {
    const p1Ids = GAMES_CONFIG.filter((g) => g.phase === 1).map((g) => g.id);
    expect(p1Ids).toContain('grandmas-shopping-list');
    expect(p1Ids).toContain('festival-memory-match');
    expect(p1Ids).toContain('daily-routine-recall');
    expect(p1Ids).toContain('shell-memory-trail');
    expect(p1Ids).toContain('what-belongs-here');
    expect(p1Ids).toContain('pack-village-basket');
    expect(p1Ids).toContain('whose-emotion');
    expect(p1Ids).toContain('find-the-difference');
  });

  it('can instantiate all 8 Phase 1 game components without crashing', () => {
    const p1Games = GAMES_CONFIG.filter((g) => g.phase === 1);
    p1Games.forEach((g) => {
      const Comp = g.component;
      expect(Comp).toBeDefined();
      expect(typeof Comp).toBe('function');
    });
  });
});

