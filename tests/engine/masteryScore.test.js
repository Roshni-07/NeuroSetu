import { describe, it, expect } from 'vitest';
import { getLevel, updateMasteryScore } from '../../src/engine/ddaEngine.js';

describe('10-Level Continuous Mastery Score Engine', () => {
  describe('getLevel(masteryScore)', () => {
    it('maps mastery scores correctly to levels 1-10 using ceil(score / 10)', () => {
      expect(getLevel(0)).toBe(1);
      expect(getLevel(1)).toBe(1);
      expect(getLevel(10)).toBe(1);
      expect(getLevel(11)).toBe(2);
      expect(getLevel(20)).toBe(2);
      expect(getLevel(21)).toBe(3);
      expect(getLevel(50)).toBe(5);
      expect(getLevel(51)).toBe(6);
      expect(getLevel(90)).toBe(9);
      expect(getLevel(91)).toBe(10);
      expect(getLevel(100)).toBe(10);
    });

    it('clamps gracefully if score is outside 0-100 or missing', () => {
      expect(getLevel(undefined)).toBe(5); // default 50 => level 5
      expect(getLevel(null)).toBe(1); // 0 => level 1
      expect(getLevel(-20)).toBe(1);
      expect(getLevel(150)).toBe(10);
    });
  });

  describe('updateMasteryScore(currentScore, event, context)', () => {
    it('correct_fast event triggers promotion: +8 capped at 100', () => {
      // Direct call with default context triggering promotion
      expect(updateMasteryScore(50, 'correct_fast')).toBe(58);
      // Cap at 100
      expect(updateMasteryScore(96, 'correct_fast')).toBe(100);
      expect(updateMasteryScore(100, 'correct_fast')).toBe(100);

      // Context-aware: only promotes at 3 consecutive fast
      expect(updateMasteryScore(50, 'correct_fast', { consecutiveFast: 1 })).toBe(50);
      expect(updateMasteryScore(50, 'correct_fast', { consecutiveFast: 2 })).toBe(50);
      expect(updateMasteryScore(50, 'correct_fast', { consecutiveFast: 3 })).toBe(58);
    });

    it('correct_slow event produces no score change', () => {
      expect(updateMasteryScore(50, 'correct_slow')).toBe(50);
      expect(updateMasteryScore(80, 'correct_slow')).toBe(80);
    });

    it('error event triggers demotion: -12 floored at 0', () => {
      // Direct call with default context triggering demotion
      expect(updateMasteryScore(50, 'error')).toBe(38);
      // Floor at 0
      expect(updateMasteryScore(10, 'error')).toBe(0);
      expect(updateMasteryScore(0, 'error')).toBe(0);

      // Context-aware: only demotes at 2 consecutive errors
      expect(updateMasteryScore(50, 'error', { consecutiveErrors: 1 })).toBe(50);
      expect(updateMasteryScore(50, 'error', { consecutiveErrors: 2 })).toBe(38);
    });

    it('timeout event (>15s) triggers immediate demotion: -12 floored at 0', () => {
      expect(updateMasteryScore(50, 'timeout')).toBe(38);
      expect(updateMasteryScore(8, 'timeout')).toBe(0);
      expect(updateMasteryScore(0, 'timeout')).toBe(0);
    });

    it('handles stateful tracking object seamlessly', () => {
      let state = { score: 50, consecutiveFast: 0, consecutiveErrors: 0 };

      // 1st fast correct
      state = updateMasteryScore(state, 'correct_fast');
      expect(state.score).toBe(50);
      expect(state.consecutiveFast).toBe(1);

      // 2nd fast correct
      state = updateMasteryScore(state, 'correct_fast');
      expect(state.score).toBe(50);
      expect(state.consecutiveFast).toBe(2);

      // 3rd fast correct -> promotion!
      state = updateMasteryScore(state, 'correct_fast');
      expect(state.score).toBe(58);
      expect(state.level).toBe(6);
      expect(state.consecutiveFast).toBe(0);

      // 1 error
      state = updateMasteryScore(state, 'error');
      expect(state.score).toBe(58);
      expect(state.consecutiveErrors).toBe(1);

      // 2nd error -> demotion!
      state = updateMasteryScore(state, 'error');
      expect(state.score).toBe(46);
      expect(state.level).toBe(5);
      expect(state.consecutiveErrors).toBe(0);
    });
  });
});
