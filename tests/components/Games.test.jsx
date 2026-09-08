import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import GridMemoryGame from '../../src/components/games/GridMemoryGame.jsx';
import VisualMatchingGame from '../../src/components/games/VisualMatchingGame.jsx';
import SequenceOrderGame from '../../src/components/games/SequenceOrderGame.jsx';
import { clearAllLocalData, closeDB } from '../../src/db/indexedDb.js';

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

describe('Task 22–25: Cognitive Game Modules & Cultural Reminiscence Tests', () => {
  beforeEach(async () => {
    await clearAllLocalData();
    vi.restoreAllMocks();
  });

  afterEach(async () => {
    await closeDB();
  });

  it('1. GridMemoryGame renders Bihu prompt, accepts correct touch answer and advances', async () => {
    render(<GridMemoryGame profileId="patient_01" initialTier={1} promptDurationMs={10} rewardDurationMs={50} />);

    // Wait for task prompt and listening state
    await waitFor(() => {
      expect(screen.getByText(/বিহুৰ বাদ্য/i)).toBeInTheDocument();
      expect(screen.getByText(/ঢোল \(Dhol\)/i)).toBeInTheDocument();
    });

    await sleep(25);

    // Select correct option "dhol"
    const dholBtn = screen.getByRole('button', { name: /ঢোল/i });
    fireEvent.click(dholBtn);

    // Shows success affirmation banner
    await waitFor(() => {
      expect(screen.getByTestId('success-banner')).toBeInTheDocument();
    });
  });

  it('2. GridMemoryGame provides gentle non-punitive hint and distractor elimination on error', async () => {
    render(<GridMemoryGame profileId="patient_01" initialTier={2} promptDurationMs={10} rewardDurationMs={50} />);

    await waitFor(() => {
      expect(screen.getByText(/বিহুৰ বাদ্য/i)).toBeInTheDocument();
    });

    await sleep(25);

    // Select wrong option "pepa"
    const pepaBtn = screen.getByRole('button', { name: /পেঁপা/i });
    fireEvent.click(pepaBtn);

    // Shows gentle hint without red buzzer
    await waitFor(() => {
      expect(screen.getByTestId('gentle-hint-banner')).toBeInTheDocument();
      expect(pepaBtn).toBeDisabled();
    });
  });

  it('3. VisualMatchingGame renders textile swatch and matches Muga silk', async () => {
    render(<VisualMatchingGame profileId="patient_01" initialTier={2} promptDurationMs={10} rewardDurationMs={50} />);

    await waitFor(() => {
      expect(screen.getByText(/সোণালী মুগা বস্ত্ৰ/i)).toBeInTheDocument();
      expect(screen.getByText(/মুগা পাট/i)).toBeInTheDocument();
    });

    await sleep(25);

    const mugaBtn = screen.getByRole('button', { name: /মুগা পাট/i });
    fireEvent.click(mugaBtn);

    await waitFor(() => {
      expect(screen.getByTestId('success-banner')).toBeInTheDocument();
    });
  });

  it('4. SequenceOrderGame allows ordering daily tea routine and completes sequence', async () => {
    const handleComplete = vi.fn();
    render(<SequenceOrderGame profileId="patient_01" onComplete={handleComplete} />);

    expect(screen.getByText(/সোৱাদভৰা অসমীয়া চাহ/i)).toBeInTheDocument();

    // Click step 1: Boil water
    const step1Btn = screen.getByRole('button', { name: /১\. চচপেনত পানী/i });
    fireEvent.click(step1Btn);

    // Click step 2: Add tea leaves
    await waitFor(() => {
      const step2Btn = screen.getByRole('button', { name: /২\. সুগন্ধি অসম চাহপাত/i });
      fireEvent.click(step2Btn);
    });

    // Click step 3: Milk and sugar
    await waitFor(() => {
      const step3Btn = screen.getByRole('button', { name: /৩\. সোৱাদ অনুসৰি গাখীৰ/i });
      fireEvent.click(step3Btn);
    });

    // Click step 4: Strain
    await waitFor(() => {
      const step4Btn = screen.getByRole('button', { name: /৪\. ফিল্টাৰেৰে চালি/i });
      fireEvent.click(step4Btn);
    });

    await waitFor(() => {
      expect(screen.getByText(/চাহ প্ৰস্তুত হ’ল!/i)).toBeInTheDocument();
      expect(handleComplete).toHaveBeenCalled();
    });
  });
});
