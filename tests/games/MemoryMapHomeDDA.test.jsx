import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, act, cleanup } from '@testing-library/react';
import React from 'react';
import MemoryMapHome from '../../src/games/MemoryMapHome.jsx';

describe('MemoryMapHome DDA & Clinical Seeding', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  it('does NOT render manual difficulty buttons (Easy, Medium, Full Path)', () => {
    render(<MemoryMapHome onComplete={vi.fn()} />);

    expect(screen.queryByRole('button', { name: /Easy/i })).toBeNull();
    expect(screen.queryByRole('button', { name: /Medium/i })).toBeNull();
    expect(screen.queryByRole('button', { name: /Full Path/i })).toBeNull();
  });

  it('seeds difficulty from patientProfile starting_difficulty_tier or status', () => {
    // 1. Tier 1 profile
    const { unmount: unmount1 } = render(
      <MemoryMapHome patientProfile={{ starting_difficulty_tier: 1 }} onComplete={vi.fn()} />
    );
    expect(screen.getByText(/Tier 1 • 3 Locations/i)).toBeInTheDocument();
    expect(screen.getByText(/Watch the character walk through 3 locations/i)).toBeInTheDocument();
    unmount1();

    // 2. Tier 2 profile
    const { unmount: unmount2 } = render(
      <MemoryMapHome patientProfile={{ starting_difficulty_tier: 2 }} onComplete={vi.fn()} />
    );
    expect(screen.getByText(/Tier 2 • 4 Locations/i)).toBeInTheDocument();
    expect(screen.getByText(/Watch the character walk through 4 locations/i)).toBeInTheDocument();
    unmount2();

    // 3. Tier 3 profile
    const { unmount: unmount3 } = render(
      <MemoryMapHome patientProfile={{ starting_difficulty_tier: 3 }} onComplete={vi.fn()} />
    );
    expect(screen.getByText(/Tier 3 • 5 Locations/i)).toBeInTheDocument();
    expect(screen.getByText(/Watch the character walk through 5 locations/i)).toBeInTheDocument();
    unmount3();

    // 4. Clinical status fallback
    const { unmount: unmount4 } = render(
      <MemoryMapHome patientProfile={{ status: 'attention' }} onComplete={vi.fn()} />
    );
    expect(screen.getByText(/Tier 2 • 4 Locations/i)).toBeInTheDocument();
    unmount4();
  });

  it('steps down difficulty smoothly after consecutive errors without harsh failure', async () => {
    vi.useFakeTimers();

    render(
      <MemoryMapHome
        patientProfile={{ starting_difficulty_tier: 2 }}
        onComplete={vi.fn()}
      />
    );

    // Initial state: Tier 2 (4 locations)
    expect(screen.getByText(/Tier 2 • 4 Locations/i)).toBeInTheDocument();

    // Tap Start Journey
    const startBtn = screen.getByRole('button', { name: /Start Journey/i });
    fireEvent.click(startBtn);

    // Fast-forward animation phase (showDuration: 1000ms * 4 = 4000ms)
    act(() => {
      vi.advanceTimersByTime(5000);
    });

    // Now in 'select' phase
    expect(screen.getByText(/🖐️ Now tap the locations in the same order!/i)).toBeInTheDocument();

    // Node buttons: let's trigger wrong node taps
    // Expected next for Tier 2 sequence is 'well', but let's tap 'bedroom' twice
    const bedroomBtn = screen.getByText('Bedroom');
    fireEvent.click(bedroomBtn); // Error 1
    fireEvent.click(bedroomBtn); // Error 2 -> DDA triggers reduction to Tier 1

    // Step down happens smoothly
    act(() => {
      vi.advanceTimersByTime(1000);
    });

    // After stepping down, it gracefully returns to 'show' mode with the gentler path (3 locations)
    expect(screen.getByText(/Adjusted path to 3 locations for comfort/i)).toBeInTheDocument();

    vi.useRealTimers();
  });

  it('completes the sequence and delivers result with tier and ddaDecision', () => {
    vi.useFakeTimers();
    const onComplete = vi.fn();
    render(
      <MemoryMapHome
        patientProfile={{ starting_difficulty_tier: 1 }}
        onComplete={onComplete}
      />
    );

    // Start Journey
    fireEvent.click(screen.getByRole('button', { name: /Start Journey/i }));

    // Fast-forward show animation (Tier 1: 3 nodes * 1000ms = 3000ms)
    act(() => {
      vi.advanceTimersByTime(4000);
    });

    // Select mode: sequence is ['well', 'garden', 'kitchen']
    const wellBtn = screen.getByText('Well');
    const gardenBtn = screen.getByText('Garden');
    const kitchenBtn = screen.getByText('Kitchen');

    fireEvent.click(wellBtn);
    fireEvent.click(gardenBtn);
    fireEvent.click(kitchenBtn);

    expect(onComplete).toHaveBeenCalledTimes(1);
    const result = onComplete.mock.calls[0][0];
    expect(result.tier).toBe(1);
    expect(result.accuracy).toBe(100);
    expect(result.subtext).toContain('Completed Tier 1 path with 3/3 steps correct.');
    expect(result.ddaDecision).toBeDefined();

    vi.useRealTimers();
  });
});
