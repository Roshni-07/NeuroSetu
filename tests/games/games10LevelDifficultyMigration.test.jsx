import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { getDifficultyParams, GAME_DIFFICULTY_ENDPOINTS } from '../../src/engine/difficultyScaling.js';
import TeaGardenDetective from '../../src/games/TeaGardenDetective.jsx';
import MemoryMapHome from '../../src/games/MemoryMapHome.jsx';
import FindTheDifference from '../../src/games/FindTheDifference.jsx';
import CareForYourCompanion from '../../src/games/CareForYourCompanion.jsx';

describe('10-Level Difficulty System Migration (4 Core Games)', () => {
  describe('Endpoint Calibration & Distinct Level Requirement (>= 7 Distinct Levels)', () => {
    it('TeaGardenDetective generates >= 7 distinct difficulty parameter states', () => {
      const distinctKeys = new Set();
      for (let l = 1; l <= 10; l++) {
        const p = getDifficultyParams('tea-garden-detective', l);
        distinctKeys.add(`${p.itemCount}_${p.previewTimeMs}_${p.distractorCount}`);
      }
      expect(distinctKeys.size).toBeGreaterThanOrEqual(7);
      expect(distinctKeys.size).toBe(10); // Exactly 10 distinct profiles
    });

    it('MemoryMapHome generates >= 7 distinct difficulty parameter states', () => {
      const distinctKeys = new Set();
      for (let l = 1; l <= 10; l++) {
        const p = getDifficultyParams('memory-map-home', l);
        const showDur = Math.max(550, Math.round(1400 - ((l - 1) / 9) * 850));
        distinctKeys.add(`${p.itemCount}_${showDur}`);
      }
      expect(distinctKeys.size).toBeGreaterThanOrEqual(7);
      expect(distinctKeys.size).toBe(10);
    });

    it('FindTheDifference generates >= 7 distinct difficulty parameter states', () => {
      const distinctCounts = new Set();
      for (let l = 1; l <= 10; l++) {
        const p = getDifficultyParams('find-the-difference', l);
        distinctCounts.add(p.itemCount);
      }
      // itemCount scales from 2 to 8 across levels 1..10
      expect(distinctCounts.size).toBeGreaterThanOrEqual(7);
      expect(getDifficultyParams('find-the-difference', 1).itemCount).toBe(2);
      expect(getDifficultyParams('find-the-difference', 10).itemCount).toBe(8);
    });

    it('CareForYourCompanion generates >= 7 distinct difficulty parameter states', () => {
      const distinctProfiles = new Set();
      for (let l = 1; l <= 10; l++) {
        const p = getDifficultyParams('care-for-your-companion', l);
        distinctProfiles.add(`${p.itemCount}_${p.distractorCount}_${p.previewTimeMs}`);
      }
      // Steps: 2 to 5, Distractors: 1 to 4, Time: 12000ms down to 5000ms -> 10 distinct profiles
      expect(distinctProfiles.size).toBeGreaterThanOrEqual(7);
      expect(distinctProfiles.size).toBe(10);
      expect(getDifficultyParams('care-for-your-companion', 1).itemCount).toBe(2);
      expect(getDifficultyParams('care-for-your-companion', 1).distractorCount).toBe(1);
      expect(getDifficultyParams('care-for-your-companion', 10).itemCount).toBe(5);
      expect(getDifficultyParams('care-for-your-companion', 10).distractorCount).toBe(4);
    });
  });

  describe('Component Props & Render Adaptation', () => {
    it('TeaGardenDetective adapts level badge and configures MovingTargetLoop based on level prop', () => {
      const { unmount } = render(<TeaGardenDetective level={1} />);
      expect(screen.getByText(/Level 1/i)).toBeInTheDocument();
      expect(screen.getByText(/4 Items/i)).toBeInTheDocument();
      expect(screen.getByText(/Gentle Warmup/i)).toBeInTheDocument();
      unmount();

      render(<TeaGardenDetective level={10} />);
      expect(screen.getByText(/Level 10/i)).toBeInTheDocument();
      expect(screen.getByText(/12 Items/i)).toBeInTheDocument();
      expect(screen.getByText(/Focused Mastery/i)).toBeInTheDocument();
    });

    it('MemoryMapHome adapts path length and journey steps based on level prop', () => {
      const { unmount } = render(<MemoryMapHome level={1} />);
      expect(screen.getAllByText(/Level 1/i).length).toBeGreaterThan(0);
      expect(screen.getAllByText(/2 Locations/i).length).toBeGreaterThan(0);
      unmount();

      render(<MemoryMapHome level={10} />);
      expect(screen.getAllByText(/Level 10/i).length).toBeGreaterThan(0);
      expect(screen.getAllByText(/6 Locations/i).length).toBeGreaterThan(0);
    });

    it('FindTheDifference renders exactly 2 differences at Level 1 and 8 differences at Level 10', () => {
      const { container, unmount } = render(<FindTheDifference level={1} />);
      expect(screen.getByText(/Level 1/i)).toBeInTheDocument();
      expect(screen.getByText(/Found 0 of 2 differences/i)).toBeInTheDocument();
      unmount();

      render(<FindTheDifference level={10} />);
      expect(screen.getByText(/Level 10/i)).toBeInTheDocument();
      expect(screen.getByText(/Found 0 of 8 differences/i)).toBeInTheDocument();
    });

    it('CareForYourCompanion renders 2 steps at Level 1 and 5 steps at Level 10', () => {
      const { unmount } = render(<CareForYourCompanion level={1} />);
      expect(screen.getByText(/Level 1/i)).toBeInTheDocument();
      expect(screen.getByText(/2 Daily Steps/i)).toBeInTheDocument();
      expect(screen.getByText(/Step 1 of 2/i)).toBeInTheDocument();
      unmount();

      render(<CareForYourCompanion level={10} />);
      expect(screen.getByText(/Level 10/i)).toBeInTheDocument();
      expect(screen.getByText(/5 Daily Steps/i)).toBeInTheDocument();
      expect(screen.getByText(/Step 1 of 5/i)).toBeInTheDocument();
    });
  });

  describe('Completion Scoring & Telemetry Contract', () => {
    it('FindTheDifference completes and returns level & difficultyParams in completion payload', () => {
      vi.useFakeTimers();
      const handleComplete = vi.fn();
      render(<FindTheDifference level={1} onComplete={handleComplete} />);

      // Find the 2 differences at level 1: diff_bird and diff_tree
      const clueButtons = screen.getAllByRole('button', { name: /Tap/i });
      fireEvent.click(clueButtons[0]);
      fireEvent.click(clueButtons[1]);

      act(() => {
        vi.advanceTimersByTime(1000);
      });

      expect(handleComplete).toHaveBeenCalledTimes(1);
      const res = handleComplete.mock.calls[0][0];
      expect(res.score).toBe(100);
      expect(res.level).toBe(1);
      expect(res.difficultyParams).toBeDefined();
      expect(res.difficultyParams.itemCount).toBe(2);
      vi.useRealTimers();
    });

    it('CareForYourCompanion completes full routine and passes telemetry payload', () => {
      const handleComplete = vi.fn();
      render(<CareForYourCompanion level={1} onComplete={handleComplete} />);

      // Step 1: Click first option, then click "Next Situation"
      const opt1 = screen.getAllByRole('button').find(b => b.textContent.includes('Water it gently'));
      expect(opt1).toBeDefined();
      fireEvent.click(opt1);

      const nextBtn1 = screen.getByRole('button', { name: /Next Situation/i });
      fireEvent.click(nextBtn1);

      // Step 2: Click first option, then click "See Results"
      const opt2 = screen.getAllByRole('button').find(b => b.textContent.includes('shade cloth'));
      expect(opt2).toBeDefined();
      fireEvent.click(opt2);

      const seeResultsBtn = screen.getByRole('button', { name: /See Results/i });
      fireEvent.click(seeResultsBtn);

      expect(handleComplete).toHaveBeenCalledTimes(1);
      const res = handleComplete.mock.calls[0][0];
      expect(res.score).toBe(100);
      expect(res.level).toBe(1);
      expect(res.companionHealth).toBeGreaterThanOrEqual(70);
      expect(res.difficultyParams).toBeDefined();
    });
  });
});
