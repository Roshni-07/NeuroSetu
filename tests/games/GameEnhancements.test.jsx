import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, act, cleanup } from '@testing-library/react';
import React from 'react';

// Import all 15 game components
import GrandmasShoppingList from '../../src/games/GrandmasShoppingList.jsx';
import WhoseMorningIsIt from '../../src/games/WhoseMorningIsIt.jsx';
import FindTheDifference from '../../src/games/FindTheDifference.jsx';
import CareForYourCompanion from '../../src/games/CareForYourCompanion.jsx';
import DailyRoutineRecall from '../../src/games/DailyRoutineRecall.jsx';
import DayInMyVillage from '../../src/games/DayInMyVillage.jsx';
import FestivalMemoryMatch from '../../src/games/FestivalMemoryMatch.jsx';
import FinishGrandmasWeave from '../../src/games/FinishGrandmasWeave.jsx';
import MemoryMapHome from '../../src/games/MemoryMapHome.jsx';
import PackVillageBasket from '../../src/games/PackVillageBasket.jsx';
import RememberTheStory from '../../src/games/RememberTheStory.jsx';
import ShellMemoryTrail from '../../src/games/ShellMemoryTrail.jsx';
import TeaGardenDetective from '../../src/games/TeaGardenDetective.jsx';
import WhatBelongsHere from '../../src/games/WhatBelongsHere.jsx';
import WhoseEmotion from '../../src/games/WhoseEmotion.jsx';

describe('Game Enhancements Suite', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  describe('1. GrandmasShoppingList.jsx — Lazy Initializer', () => {
    it('initializes targetList immediately on first paint with 4 items and no 0 items flash', () => {
      render(<GrandmasShoppingList onComplete={vi.fn()} />);

      // Must show 4 items immediately on first paint
      expect(screen.getByText(/Remember these 4 items/i)).toBeInTheDocument();
      expect(screen.queryByText(/Remember these 0 items/i)).toBeNull();

      // Verify that exactly 4 items from the market pool are picked and rendered immediately on first paint
      const allLabels = [
        'Assam CTC Tea', 'Joha Fragrant Rice', 'Tender Bamboo Shoot', 'Raw Wild Turmeric',
        'Tezpatta Bay Leaves', 'Bhut Jolokia Pepper', 'Pure Mustard Oil', 'Fresh River Rohu',
        'Betel Nut & Paan', 'Rice Flour Pitha'
      ];
      const displayedItems = allLabels.filter((label) => screen.queryByText(label) !== null);
      expect(displayedItems.length).toBe(4);
    });

    it('renders Exit to Hub button and triggers onExit when tapped', () => {
      const handleExit = vi.fn();
      render(<GrandmasShoppingList onComplete={vi.fn()} onExit={handleExit} />);

      const exitBtn = screen.getByRole('button', { name: /Exit to hub/i });
      expect(exitBtn).toBeInTheDocument();
      fireEvent.click(exitBtn);
      expect(handleExit).toHaveBeenCalledTimes(1);
    });
  });

  describe('2. WhoseMorningIsIt.jsx — Sound Numbering, Slowdown & Replay', () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('displays numbered sound badges (1, 2, 3, 4) in the sequence strip', () => {
      render(<WhoseMorningIsIt onComplete={vi.fn()} />);

      // Dismiss instructions modal if present
      const modalBtn = screen.queryByRole('button', { name: /Start Playing/i });
      if (modalBtn) fireEvent.click(modalBtn);

      // Start the morning sound sequence
      const playBtn = screen.getByRole('button', { name: /Play Morning Sounds/i });
      fireEvent.click(playBtn);

      // Sequence numbers 1, 2, 3, 4 should be rendered
      expect(screen.getByText('Sound 1')).toBeInTheDocument();
      expect(screen.getByText('Sound 2')).toBeInTheDocument();
      expect(screen.getByText('Sound 3')).toBeInTheDocument();
      expect(screen.getByText('Sound 4')).toBeInTheDocument();
    });

    it('provides individual replay buttons for each sound and allows replaying before committing answer', () => {
      render(<WhoseMorningIsIt onComplete={vi.fn()} />);

      // Dismiss instructions modal
      const modalBtn = screen.queryByRole('button', { name: /Start Playing/i });
      if (modalBtn) fireEvent.click(modalBtn);

      // Start sequence
      const playBtn = screen.getByRole('button', { name: /Play Morning Sounds/i });
      fireEvent.click(playBtn);

      // Advance timers so all 4 sounds finish playing (4 * 2400ms = 9600ms + buffer)
      act(() => {
        vi.advanceTimersByTime(11000);
      });

      // User instruction to place sounds should appear
      expect(screen.getByText(/Now arrange the sounds in the order you heard them/i)).toBeInTheDocument();

      // Check that individual replay buttons are available
      const replayButtons = screen.getAllByRole('button', { name: /Listen to/i });
      expect(replayButtons.length).toBe(4);

      // Replaying sound 1
      act(() => {
        fireEvent.click(replayButtons[0]);
      });
      expect(replayButtons[0]).toBeInTheDocument();
    });

    it('renders Exit to Hub button and calls onExit', () => {
      const handleExit = vi.fn();
      render(<WhoseMorningIsIt onComplete={vi.fn()} onExit={handleExit} />);

      const exitBtn = screen.getAllByRole('button', { name: /Exit to hub/i })[0];
      expect(exitBtn).toBeInTheDocument();
      fireEvent.click(exitBtn);
      expect(handleExit).toHaveBeenCalledTimes(1);
    });
  });

  describe('3. FindTheDifference.jsx — UI/UX and Touch Targets', () => {
    it('renders high-contrast cards and difference hotspots with accessible touch targets', () => {
      render(<FindTheDifference onComplete={vi.fn()} />);

      // Shows Scene 1 and Scene 2 side by side
      expect(screen.getByText(/Scene 1 \(Original\)/i)).toBeInTheDocument();
      expect(screen.getByText(/Scene 2 \(Spot Differences\)/i)).toBeInTheDocument();

      // Touch target hotspots exist and have at least 52px min-dimensions
      const differenceHotspots = screen.getAllByRole('button', { name: /Spot difference:/i });
      expect(differenceHotspots.length).toBe(8);

      differenceHotspots.forEach((spot) => {
        expect(spot.className).toContain('min-h-[52px]');
        expect(spot.className).toContain('min-w-[52px]');
      });
    });

    it('clicking a difference hotspot discovers it, displays feedback clue, and counts towards total', () => {
      render(<FindTheDifference onComplete={vi.fn()} />);

      expect(screen.getByText(/Found 0 of 4 differences/i)).toBeInTheDocument();

      const hotspots = screen.getAllByRole('button', { name: /Spot difference:/i });
      fireEvent.click(hotspots[0]);

      expect(screen.getByText(/Found 1 of 4 differences/i)).toBeInTheDocument();
      expect(screen.getByText(/Discovered Clues \(1 of 4 found\):/i)).toBeInTheDocument();
      expect(screen.getByText('✓')).toBeInTheDocument();
    });

    it('renders Exit to Hub button and calls onExit', () => {
      const handleExit = vi.fn();
      render(<FindTheDifference onComplete={vi.fn()} onExit={handleExit} />);

      const exitBtn = screen.getByRole('button', { name: /Exit to hub/i });
      expect(exitBtn).toBeInTheDocument();
      fireEvent.click(exitBtn);
      expect(handleExit).toHaveBeenCalledTimes(1);
    });
  });

  describe('4. Universal onExit Prop Across All 15 Games', () => {
    const allGames = [
      { name: "GrandmasShoppingList", component: GrandmasShoppingList },
      { name: "WhoseMorningIsIt", component: WhoseMorningIsIt },
      { name: "FindTheDifference", component: FindTheDifference },
      { name: "CareForYourCompanion", component: CareForYourCompanion },
      { name: "DailyRoutineRecall", component: DailyRoutineRecall },
      { name: "DayInMyVillage", component: DayInMyVillage },
      { name: "FestivalMemoryMatch", component: FestivalMemoryMatch },
      { name: "FinishGrandmasWeave", component: FinishGrandmasWeave },
      { name: "MemoryMapHome", component: MemoryMapHome },
      { name: "PackVillageBasket", component: PackVillageBasket },
      { name: "RememberTheStory", component: RememberTheStory },
      { name: "ShellMemoryTrail", component: ShellMemoryTrail },
      { name: "TeaGardenDetective", component: TeaGardenDetective },
      { name: "WhatBelongsHere", component: WhatBelongsHere },
      { name: "WhoseEmotion", component: WhoseEmotion },
    ];

    it('contains exactly 15 games in the test matrix', () => {
      expect(allGames.length).toBe(15);
    });

    allGames.forEach(({ name, component: Component }) => {
      it(`${name} renders Exit to Hub button and triggers onExit callback on tap`, () => {
        const handleExit = vi.fn();
        render(<Component onComplete={vi.fn()} onExit={handleExit} />);

        // Find the Exit to Hub button by aria-label
        const exitButtons = screen.getAllByRole('button', { name: /Exit to hub/i });
        expect(exitButtons.length).toBeGreaterThan(0);

        // Click the first exit button
        fireEvent.click(exitButtons[0]);
        expect(handleExit).toHaveBeenCalledTimes(1);
      });
    });
  });
});
