import { describe, it, expect } from 'vitest';
import {
  evaluateDifficulty,
  DIFFICULTY_TIERS,
  DDA_CONFIG
} from '../../src/engine/ddaEngine.js';

describe('Task 18 & 19: Dynamic Difficulty Adjustment (DDA) Engine Tests', () => {
  it('1. Reduces difficulty tier when triggered by 2 consecutive errors', () => {
    const decision = evaluateDifficulty(DIFFICULTY_TIERS.TIER_2, {
      consecutiveErrors: 2,
      latencyMs: 4500,
      consecutiveSuccesses: 0
    });

    expect(decision.action).toBe('decreased');
    expect(decision.previousTier).toBe(2);
    expect(decision.newTier).toBe(1);
    expect(decision.alertTriggered).toBe(true);
    expect(decision.reason).toContain('2 consecutive errors');
  });

  it('2. Does not reduce difficulty tier on a single isolated error', () => {
    const decision = evaluateDifficulty(DIFFICULTY_TIERS.TIER_2, {
      consecutiveErrors: 1,
      latencyMs: 5000,
      consecutiveSuccesses: 0
    });

    expect(decision.action).toBe('maintained');
    expect(decision.newTier).toBe(2);
    expect(decision.alertTriggered).toBe(false);
  });

  it('3. Reduces difficulty tier when response latency exceeds 15 seconds threshold', () => {
    const decision = evaluateDifficulty(DIFFICULTY_TIERS.TIER_3, {
      consecutiveErrors: 0,
      latencyMs: 15200, // > 15s
      consecutiveSuccesses: 1
    });

    expect(decision.action).toBe('decreased');
    expect(decision.previousTier).toBe(3);
    expect(decision.newTier).toBe(2);
    expect(decision.alertTriggered).toBe(true);
    expect(decision.reason).toContain('response latency');
  });

  it('4. Clamps at floor tier (Tier 1) when reduction triggered at minimum difficulty', () => {
    const decision = evaluateDifficulty(DIFFICULTY_TIERS.TIER_1, {
      consecutiveErrors: 2,
      latencyMs: 16000
    });

    expect(decision.action).toBe('maintained_at_minimum');
    expect(decision.previousTier).toBe(1);
    expect(decision.newTier).toBe(1);
    expect(decision.alertTriggered).toBe(true);
  });

  it('5. Promotes difficulty tier after 3 consecutive fast, correct answers', () => {
    const decision = evaluateDifficulty(DIFFICULTY_TIERS.TIER_1, {
      consecutiveErrors: 0,
      latencyMs: 4000, // < 8s
      consecutiveSuccesses: 3
    });

    expect(decision.action).toBe('increased');
    expect(decision.previousTier).toBe(1);
    expect(decision.newTier).toBe(2);
    expect(decision.alertTriggered).toBe(false);
  });

  it('6. Clamps at ceiling tier (Tier 3) when promotion triggered at maximum difficulty', () => {
    const decision = evaluateDifficulty(DIFFICULTY_TIERS.TIER_3, {
      consecutiveErrors: 0,
      latencyMs: 3000,
      consecutiveSuccesses: 3
    });

    expect(decision.action).toBe('maintained_at_maximum');
    expect(decision.previousTier).toBe(3);
    expect(decision.newTier).toBe(3);
  });

  it('7. Maintains difficulty tier during standard gameplay within bounds', () => {
    const decision = evaluateDifficulty(DIFFICULTY_TIERS.TIER_2, {
      consecutiveErrors: 0,
      latencyMs: 7500, // Standard healthy latency
      consecutiveSuccesses: 1
    });

    expect(decision.action).toBe('maintained');
    expect(decision.newTier).toBe(2);
    expect(decision.alertTriggered).toBe(false);
  });
});
