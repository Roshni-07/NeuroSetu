import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import React from 'react';
import FestivalMemoryMatch from '../../src/games/FestivalMemoryMatch.jsx';

describe('BUG D: Festival Memory Match Turn Counter Verification', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('1. Turn counter starts at 0 on mount', () => {
    render(<FestivalMemoryMatch level={1} onComplete={vi.fn()} />);

    expect(screen.getByText(/Turns taken: 0/i)).toBeInTheDocument();
    expect(screen.getByText(/Pairs matched: 0 of 2/i)).toBeInTheDocument();
  });

  it('2. Turn counter does NOT increment on first card click of a pair attempt', () => {
    render(<FestivalMemoryMatch level={1} onComplete={vi.fn()} />);

    const cardButtons = screen.getAllByRole('button', { name: /Hidden card/i });
    expect(cardButtons.length).toBe(4); // 2 pairs = 4 cards

    // Click 1st card
    fireEvent.click(cardButtons[0]);

    // Turns taken MUST remain 0 (1 card flipped, pair attempt incomplete)
    expect(screen.getByText(/Turns taken: 0/i)).toBeInTheDocument();
  });

  it('3. Turn counter increments to 1 ONLY after second card click (pair attempt complete)', () => {
    render(<FestivalMemoryMatch level={1} onComplete={vi.fn()} />);

    const cardButtons = screen.getAllByRole('button', { name: /Hidden card/i });

    // Click 1st card
    fireEvent.click(cardButtons[0]);
    expect(screen.getByText(/Turns taken: 0/i)).toBeInTheDocument();

    // Click 2nd card
    fireEvent.click(cardButtons[1]);

    // Turns taken MUST increment to 1 (pair attempt evaluated)
    expect(screen.getByText(/Turns taken: 1/i)).toBeInTheDocument();
  });

  it('4. Re-clicking already flipped or matched card does not increment turn count', () => {
    render(<FestivalMemoryMatch level={1} onComplete={vi.fn()} />);

    const cardButtons = screen.getAllByRole('button', { name: /Hidden card/i });

    // Click 1st card
    fireEvent.click(cardButtons[0]);
    expect(screen.getByText(/Turns taken: 0/i)).toBeInTheDocument();

    // Re-click 1st card (already flipped)
    fireEvent.click(cardButtons[0]);
    expect(screen.getByText(/Turns taken: 0/i)).toBeInTheDocument();
  });
});
