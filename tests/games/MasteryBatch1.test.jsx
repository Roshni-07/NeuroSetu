import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import GrandmasShoppingList from '../../src/games/GrandmasShoppingList.jsx';
import FestivalMemoryMatch from '../../src/games/FestivalMemoryMatch.jsx';
import DailyRoutineRecall from '../../src/games/DailyRoutineRecall.jsx';
import ShellMemoryTrail from '../../src/games/ShellMemoryTrail.jsx';
import { getDifficultyParams } from '../../src/engine/difficultyScaling.js';

describe('Batch 1: 10-Level Difficulty Scaling & Parameter Verification', () => {
  afterEach(() => {
    cleanup();
  });

  describe('1. GrandmasShoppingList', () => {
    it('scales params from level 1 (easiest) to level 10 (hardest)', () => {
      const l1 = getDifficultyParams('grandmas-shopping-list', 1);
      const l10 = getDifficultyParams('grandmas-shopping-list', 10);

      expect(l1.itemCount).toBe(2);
      expect(l1.distractorCount).toBe(2);
      expect(l1.previewTimeMs).toBe(10000);
      expect(l1.distractorSimilarity).toBe('low');

      expect(l10.itemCount).toBe(6);
      expect(l10.distractorCount).toBe(6);
      expect(l10.previewTimeMs).toBe(5000);
      expect(l10.distractorSimilarity).toBe('high');

      expect(l1.itemCount).toBeLessThan(l10.itemCount);
      expect(l1.previewTimeMs).toBeGreaterThan(l10.previewTimeMs);
    });

    it('renders Level 1/10 and Level 10/10 indicators in header', () => {
      const { unmount } = render(<GrandmasShoppingList level={1} onComplete={vi.fn()} />);
      expect(screen.getByText('Level 1/10')).toBeInTheDocument();
      expect(screen.getByText(/Remember these 2 items/i)).toBeInTheDocument();
      unmount();

      render(<GrandmasShoppingList level={10} onComplete={vi.fn()} />);
      expect(screen.getByText('Level 10/10')).toBeInTheDocument();
      expect(screen.getByText(/Remember these 6 items/i)).toBeInTheDocument();
    });
  });

  describe('2. FestivalMemoryMatch', () => {
    it('scales params from level 1 (easiest) to level 10 (hardest)', () => {
      const l1 = getDifficultyParams('festival-memory-match', 1);
      const l10 = getDifficultyParams('festival-memory-match', 10);

      expect(l1.itemCount).toBe(2); // 2 pairs (4 cards)
      expect(l1.previewTimeMs).toBe(2500); // 2500ms reveal delay
      expect(l1.distractorSimilarity).toBe('low');

      expect(l10.itemCount).toBe(6); // 6 pairs (12 cards)
      expect(l10.previewTimeMs).toBe(2000); // floored at 2000ms
      expect(l10.distractorSimilarity).toBe('high');

      expect(l1.itemCount).toBeLessThan(l10.itemCount);
    });

    it('renders Level 1/10 and Level 10/10 indicators with correct card counts', () => {
      const { unmount } = render(<FestivalMemoryMatch level={1} onComplete={vi.fn()} />);
      expect(screen.getByText('Level 1/10')).toBeInTheDocument();
      expect(screen.getByText(/Pairs matched: 0 of 2/i)).toBeInTheDocument();
      unmount();

      render(<FestivalMemoryMatch level={10} onComplete={vi.fn()} />);
      expect(screen.getByText('Level 10/10')).toBeInTheDocument();
      expect(screen.getByText(/Pairs matched: 0 of 6/i)).toBeInTheDocument();
    });
  });

  describe('3. DailyRoutineRecall', () => {
    it('scales params from level 1 (easiest) to level 10 (hardest)', () => {
      const l1 = getDifficultyParams('daily-routine-recall', 1);
      const l10 = getDifficultyParams('daily-routine-recall', 10);

      expect(l1.itemCount).toBe(2); // 2 items
      expect(l1.distractorSimilarity).toBe('low');

      expect(l10.itemCount).toBe(6); // 6 items
      expect(l10.distractorSimilarity).toBe('high');

      expect(l1.itemCount).toBeLessThan(l10.itemCount);
    });

    it('renders Level 1/10 (2 steps) and Level 10/10 (6 steps)', () => {
      const { unmount } = render(<DailyRoutineRecall level={1} onComplete={vi.fn()} />);
      expect(screen.getByText('Level 1/10')).toBeInTheDocument();
      unmount();

      render(<DailyRoutineRecall level={10} onComplete={vi.fn()} />);
      expect(screen.getByText('Level 10/10')).toBeInTheDocument();
    });
  });

  describe('4. ShellMemoryTrail', () => {
    it('scales params from level 1 (easiest) to level 10 (hardest)', () => {
      const l1 = getDifficultyParams('shell-memory-trail', 1);
      const l10 = getDifficultyParams('shell-memory-trail', 10);

      expect(l1.itemCount).toBe(3); // 3 shells
      expect(l1.previewTimeMs).toBe(3500); // 3500ms highlight
      expect(l1.distractorSimilarity).toBe('low');

      expect(l10.itemCount).toBe(6); // 6 shells
      expect(l10.previewTimeMs).toBe(2000); // floored at 2000ms
      expect(l10.distractorSimilarity).toBe('high');

      expect(l1.itemCount).toBeLessThan(l10.itemCount);
      expect(l1.previewTimeMs).toBeGreaterThan(l10.previewTimeMs);
    });

    it('renders Level 1/10 and Level 10/10 indicators in header', () => {
      const { unmount } = render(<ShellMemoryTrail level={1} onComplete={vi.fn()} />);
      expect(screen.getByText('Level 1/10')).toBeInTheDocument();
      unmount();

      render(<ShellMemoryTrail level={10} onComplete={vi.fn()} />);
      expect(screen.getByText('Level 10/10')).toBeInTheDocument();
    });
  });
});
