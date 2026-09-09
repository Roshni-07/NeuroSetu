import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { getDifficultyParams } from '../../src/engine/difficultyScaling.js';
import RememberTheStory from '../../src/games/RememberTheStory.jsx';
import WhoseMorningIsIt from '../../src/games/WhoseMorningIsIt.jsx';
import WhoseEmotion from '../../src/games/WhoseEmotion.jsx';

describe('10-Level Difficulty System Migration — Batch 11C (Final 3 Core Games)', () => {
  describe('Endpoint Calibration & Distinct Level Requirement (>= 7 Distinct Levels)', () => {
    it('RememberTheStory generates >= 7 distinct difficulty parameter states', () => {
      const distinctKeys = new Set();
      for (let l = 1; l <= 10; l++) {
        const p = getDifficultyParams('remember-the-story', l);
        distinctKeys.add(`${p.itemCount}_${p.distractorCount}_${p.previewTimeMs}`);
      }
      expect(distinctKeys.size).toBeGreaterThanOrEqual(7);
      expect(distinctKeys.size).toBe(10);
      expect(getDifficultyParams('remember-the-story', 1).itemCount).toBe(2);
      expect(getDifficultyParams('remember-the-story', 1).distractorCount).toBe(1);
      expect(getDifficultyParams('remember-the-story', 10).itemCount).toBe(5);
      expect(getDifficultyParams('remember-the-story', 10).distractorCount).toBe(3);
    });

    it('WhoseMorningIsIt generates >= 7 distinct difficulty parameter states and strictly respects 2400ms floor', () => {
      const distinctKeys = new Set();
      for (let l = 1; l <= 10; l++) {
        const p = getDifficultyParams('whose-morning-is-it', l);
        distinctKeys.add(`${p.itemCount}_${p.previewTimeMs}`);
        expect(p.previewTimeMs).toBeGreaterThanOrEqual(2400);
      }
      expect(distinctKeys.size).toBeGreaterThanOrEqual(7);
      expect(distinctKeys.size).toBe(8);
      expect(getDifficultyParams('whose-morning-is-it', 1).itemCount).toBe(2);
      expect(getDifficultyParams('whose-morning-is-it', 1).previewTimeMs).toBe(3600);
      expect(getDifficultyParams('whose-morning-is-it', 10).itemCount).toBe(6);
      expect(getDifficultyParams('whose-morning-is-it', 10).previewTimeMs).toBe(2400);
    });

    it('WhoseEmotion generates >= 7 distinct difficulty parameter states', () => {
      const distinctKeys = new Set();
      for (let l = 1; l <= 10; l++) {
        const p = getDifficultyParams('whose-emotion', l);
        distinctKeys.add(`${p.itemCount}_${p.distractorCount}`);
      }
      expect(distinctKeys.size).toBeGreaterThanOrEqual(7);
      expect(getDifficultyParams('whose-emotion', 1).itemCount).toBe(2);
      expect(getDifficultyParams('whose-emotion', 1).distractorCount).toBe(1);
      expect(getDifficultyParams('whose-emotion', 10).itemCount).toBe(6);
      expect(getDifficultyParams('whose-emotion', 10).distractorCount).toBe(3);
    });
  });

  describe('Component Props & Render Adaptation', () => {
    it('RememberTheStory adapts question count and choices per question based on level prop', () => {
      const { unmount } = render(<RememberTheStory level={1} />);
      expect(screen.getByText(/Level 1/i)).toBeInTheDocument();
      expect(screen.getByText(/2 Questions • 2 Choices \/ Question/i)).toBeInTheDocument();
      unmount();

      render(<RememberTheStory level={10} />);
      expect(screen.getByText(/Level 10/i)).toBeInTheDocument();
      expect(screen.getByText(/5 Questions • 4 Choices \/ Question/i)).toBeInTheDocument();
    });

    it('WhoseMorningIsIt adapts sound sequence length and interval based on level prop', () => {
      const { unmount } = render(<WhoseMorningIsIt level={1} />);
      expect(screen.getByText(/Level 1/i)).toBeInTheDocument();
      expect(screen.getByText(/2 Sounds Sequence • 3.6s Pace/i)).toBeInTheDocument();
      unmount();

      render(<WhoseMorningIsIt level={10} />);
      expect(screen.getByText(/Level 10/i)).toBeInTheDocument();
      expect(screen.getByText(/6 Sounds Sequence • 2.4s Pace/i)).toBeInTheDocument();
    });

    it('WhoseEmotion adapts round count and choices per round based on level prop', () => {
      const { unmount } = render(<WhoseEmotion level={1} />);
      expect(screen.getByText(/Level 1/i)).toBeInTheDocument();
      expect(screen.getByText(/2 Emotional Scenarios • 2 Choices \/ Round/i)).toBeInTheDocument();
      expect(screen.getByText(/Question 1 of 2/i)).toBeInTheDocument();
      unmount();

      render(<WhoseEmotion level={10} />);
      expect(screen.getByText(/Level 10/i)).toBeInTheDocument();
      expect(screen.getByText(/6 Emotional Scenarios • 4 Choices \/ Round/i)).toBeInTheDocument();
      expect(screen.getByText(/Question 1 of 6/i)).toBeInTheDocument();
    });
  });

  describe('Completion Scoring & Telemetry Contract', () => {
    it('RememberTheStory completes and passes level & difficultyParams in payload', () => {
      const handleComplete = vi.fn();
      render(<RememberTheStory level={1} onComplete={handleComplete} />);

      // Navigate past reading pages
      const nextBtn = screen.getByRole('button', { name: /Next →/i });
      fireEvent.click(nextBtn);

      const answerBtn = screen.getByRole('button', { name: /Answer Questions →/i });
      fireEvent.click(answerBtn);

      // Answer 2 questions at level 1
      for (let q = 0; q < 2; q++) {
        const optionButtons = screen.getAllByRole('button').filter(b => b.textContent && (b.textContent.includes('A.') || b.textContent.includes('B.')));
        if (optionButtons.length > 0) {
          fireEvent.click(optionButtons[0]);
        }
        const nextQBtn = screen.getByRole('button', { name: /Next Question|See Results/i });
        fireEvent.click(nextQBtn);
      }

      expect(handleComplete).toHaveBeenCalledTimes(1);
      const res = handleComplete.mock.calls[0][0];
      expect(res.level).toBe(1);
      expect(res.difficultyParams).toBeDefined();
      expect(res.difficultyParams.itemCount).toBe(2);
      expect(res.difficultyParams.distractorCount).toBe(1);
    });

    it('WhoseMorningIsIt completes and returns level & difficultyParams in payload', () => {
      const handleComplete = vi.fn();
      render(<WhoseMorningIsIt level={1} onComplete={handleComplete} />);

      // Start sequence
      const playBtn = screen.getByRole('button', { name: /Play Morning Sounds/i });
      fireEvent.click(playBtn);

      // Sockets at level 1: 2 order zones (order-0, order-1)
      const zone0 = screen.getByTestId('drop-zone-order-0');
      const zone1 = screen.getByTestId('drop-zone-order-1');

      // Click first sound then zone 0
      const rainItem = screen.getByTestId('drag-item-rain');
      fireEvent.click(rainItem);
      fireEvent.click(zone0);

      // Click second sound then zone 1
      const birdsItem = screen.getByTestId('drag-item-birds');
      fireEvent.click(birdsItem);
      fireEvent.click(zone1);

      // Check Order button
      const checkBtn = screen.getByRole('button', { name: /Check Order/i });
      fireEvent.click(checkBtn);

      expect(handleComplete).toHaveBeenCalledTimes(1);
      const res = handleComplete.mock.calls[0][0];
      expect(res.level).toBe(1);
      expect(res.difficultyParams).toBeDefined();
      expect(res.difficultyParams.itemCount).toBe(2);
    });

    it('WhoseEmotion completes 2 rounds at Level 1 and passes telemetry payload', () => {
      const handleComplete = vi.fn();
      render(<WhoseEmotion level={1} onComplete={handleComplete} />);

      // Round 1
      const situation1 = screen.getAllByRole('button').find(b => b.textContent && !b.textContent.includes('Exit') && !b.textContent.includes('Next') && !b.textContent.includes('Finish'));
      if (situation1) fireEvent.click(situation1);

      const nextBtn = screen.getByRole('button', { name: /Next Emotion/i });
      fireEvent.click(nextBtn);

      // Round 2
      const situation2 = screen.getAllByRole('button').find(b => b.textContent && !b.textContent.includes('Exit') && !b.textContent.includes('Next') && !b.textContent.includes('Finish'));
      if (situation2) fireEvent.click(situation2);

      const finishBtn = screen.getByRole('button', { name: /Finish/i });
      fireEvent.click(finishBtn);

      expect(handleComplete).toHaveBeenCalledTimes(1);
      const res = handleComplete.mock.calls[0][0];
      expect(res.level).toBe(1);
      expect(res.difficultyParams).toBeDefined();
      expect(res.difficultyParams.itemCount).toBe(2);
      expect(res.difficultyParams.distractorCount).toBe(1);
    });
  });
});
