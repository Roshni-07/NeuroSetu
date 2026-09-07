import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup, act } from '@testing-library/react';
import React from 'react';
import GrandmasShoppingList from '../../src/games/GrandmasShoppingList.jsx';
import FestivalMemoryMatch from '../../src/games/FestivalMemoryMatch.jsx';
import DailyRoutineRecall from '../../src/games/DailyRoutineRecall.jsx';
import ShellMemoryTrail from '../../src/games/ShellMemoryTrail.jsx';

describe('Batch 1: Memory Games Per-Tier Content Variation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  describe('1. GrandmasShoppingList Per-Tier Variation', () => {
    it('Tier 1: Renders 2 target items and 10s preview countdown', () => {
      render(<GrandmasShoppingList tier={1} onComplete={vi.fn()} />);

      expect(screen.getByText(/Remember these 2 items/i)).toBeInTheDocument();
      expect(screen.getByText(/10s remaining/i)).toBeInTheDocument();

      // Proceed to selection
      fireEvent.click(screen.getByRole('button', { name: /I am Ready!/i }));
      expect(screen.getByText(/0 selected of 2 needed/i)).toBeInTheDocument();
    });

    it('Tier 2 (Baseline): Renders 4 target items and 6s countdown by default', () => {
      render(<GrandmasShoppingList onComplete={vi.fn()} />);

      expect(screen.getByText(/Remember these 4 items/i)).toBeInTheDocument();
      expect(screen.getByText(/6s remaining/i)).toBeInTheDocument();

      // Proceed to selection
      fireEvent.click(screen.getByRole('button', { name: /I am Ready!/i }));
      expect(screen.getByText(/0 selected of 4 needed/i)).toBeInTheDocument();
    });

    it('Tier 3: Renders 6 target items and 5s countdown', () => {
      render(<GrandmasShoppingList tier={3} onComplete={vi.fn()} />);

      expect(screen.getByText(/Remember these 6 items/i)).toBeInTheDocument();
      expect(screen.getByText(/5s remaining/i)).toBeInTheDocument();

      // Proceed to selection
      fireEvent.click(screen.getByRole('button', { name: /I am Ready!/i }));
      expect(screen.getByText(/0 selected of 6 needed/i)).toBeInTheDocument();
    });

    it('Seeds tier from patientProfile clinical status (critical -> Tier 1)', () => {
      render(
        <GrandmasShoppingList
          patientProfile={{ status: 'critical' }}
          onComplete={vi.fn()}
        />
      );

      expect(screen.getByText(/Remember these 2 items/i)).toBeInTheDocument();
      expect(screen.getByText(/10s remaining/i)).toBeInTheDocument();
    });
  });

  describe('2. FestivalMemoryMatch Per-Tier Variation', () => {
    it('Tier 1: Generates 4 cards (2 pairs)', () => {
      render(<FestivalMemoryMatch tier={1} onComplete={vi.fn()} />);

      expect(screen.getByText(/Pairs matched: 0 of 2/i)).toBeInTheDocument();
      const cards = screen.getAllByRole('button', { name: /Hidden card/i });
      expect(cards.length).toBe(4);
    });

    it('Tier 2 (Baseline): Generates 8 cards (4 pairs) by default', () => {
      render(<FestivalMemoryMatch onComplete={vi.fn()} />);

      expect(screen.getByText(/Pairs matched: 0 of 4/i)).toBeInTheDocument();
      const cards = screen.getAllByRole('button', { name: /Hidden card/i });
      expect(cards.length).toBe(8);
    });

    it('Tier 3: Generates 12 cards (6 pairs)', () => {
      render(<FestivalMemoryMatch tier={3} onComplete={vi.fn()} />);

      expect(screen.getByText(/Pairs matched: 0 of 6/i)).toBeInTheDocument();
      const cards = screen.getAllByRole('button', { name: /Hidden card/i });
      expect(cards.length).toBe(12);
    });
  });

  describe('3. DailyRoutineRecall Per-Tier Variation', () => {
    it('Tier 1: Generates 2 items and 2 drop zones', () => {
      render(<DailyRoutineRecall tier={1} onComplete={vi.fn()} />);

      expect(screen.getByText('Morning Chai')).toBeInTheDocument();
      expect(screen.getByText('Night Rest')).toBeInTheDocument();

      expect(screen.getByText(/1st • Early Morning/i)).toBeInTheDocument();
      expect(screen.getByText(/2nd • Night Rest/i)).toBeInTheDocument();
      expect(screen.queryByText(/3rd • Midday Care/i)).toBeNull();
    });

    it('Tier 2 (Baseline): Generates 5 items and 5 drop zones by default', () => {
      render(<DailyRoutineRecall onComplete={vi.fn()} />);

      expect(screen.getByText('Morning Chai')).toBeInTheDocument();
      expect(screen.getByText('Tending Garden')).toBeInTheDocument();
      expect(screen.getByText('Taking Medicine')).toBeInTheDocument();
      expect(screen.getByText('Midday Meal')).toBeInTheDocument();
      expect(screen.getByText('Night Rest')).toBeInTheDocument();

      expect(screen.getByText(/1st • Early Morning/i)).toBeInTheDocument();
      expect(screen.getByText(/2nd • Morning Routine/i)).toBeInTheDocument();
      expect(screen.getByText(/3rd • Midday Care/i)).toBeInTheDocument();
      expect(screen.getByText(/4th • Afternoon Lunch/i)).toBeInTheDocument();
      expect(screen.getByText(/5th • Night Rest/i)).toBeInTheDocument();
    });

    it('Tier 3: Generates 6 items and 6 drop zones', () => {
      render(<DailyRoutineRecall tier={3} onComplete={vi.fn()} />);

      expect(screen.getByText('Morning Chai')).toBeInTheDocument();
      expect(screen.getByText('Tending Garden')).toBeInTheDocument();
      expect(screen.getByText('Taking Medicine')).toBeInTheDocument();
      expect(screen.getByText('Midday Meal')).toBeInTheDocument();
      expect(screen.getByText('Afternoon Rest')).toBeInTheDocument();
      expect(screen.getByText('Night Rest')).toBeInTheDocument();

      expect(screen.getByText(/1st • Early Morning/i)).toBeInTheDocument();
      expect(screen.getByText(/5th • Afternoon Rest/i)).toBeInTheDocument();
      expect(screen.getByText(/6th • Night Rest/i)).toBeInTheDocument();
    });
  });

  describe('4. ShellMemoryTrail Per-Tier Variation', () => {
    it('Tier 1: Renders 3 items on screen', () => {
      render(<ShellMemoryTrail tier={1} onComplete={vi.fn()} />);

      expect(screen.getByText('Cowrie')).toBeInTheDocument();
      expect(screen.getByText('Plant')).toBeInTheDocument();
      expect(screen.getByText('Cow')).toBeInTheDocument();
      expect(screen.queryByText('River Pebble')).toBeNull();
    });

    it('Tier 2 (Baseline): Renders 5 items by default', () => {
      render(<ShellMemoryTrail onComplete={vi.fn()} />);

      expect(screen.getByText('Cowrie')).toBeInTheDocument();
      expect(screen.getByText('Tea')).toBeInTheDocument();
      expect(screen.getByText('Plant')).toBeInTheDocument();
      expect(screen.getByText('Flower')).toBeInTheDocument();
      expect(screen.getByText('Cow')).toBeInTheDocument();
      expect(screen.queryByText('River Pebble')).toBeNull();
    });

    it('Tier 3: Renders 6 items including River Pebble', () => {
      render(<ShellMemoryTrail tier={3} onComplete={vi.fn()} />);

      expect(screen.getByText('Cowrie')).toBeInTheDocument();
      expect(screen.getByText('Tea')).toBeInTheDocument();
      expect(screen.getByText('Plant')).toBeInTheDocument();
      expect(screen.getByText('Flower')).toBeInTheDocument();
      expect(screen.getByText('Cow')).toBeInTheDocument();
      expect(screen.getByText('River Pebble')).toBeInTheDocument();
    });
  });
});
