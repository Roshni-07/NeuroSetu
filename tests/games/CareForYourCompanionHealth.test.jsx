import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, act, cleanup, waitFor } from '@testing-library/react';
import React from 'react';
import CareForYourCompanion, { getCompanionStatus } from '../../src/games/CareForYourCompanion.jsx';

describe('Task 2: CareForYourCompanion.jsx Cumulative Companion Health', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  describe('getCompanionStatus utility function', () => {
    it('returns proper tiers, labels, and icons for tea_plant', () => {
      const thriving = getCompanionStatus('tea_plant', 85);
      expect(thriving.icon).toBe('🌿');
      expect(thriving.tier).toBe('thriving');
      expect(thriving.status).toBe('Thriving & Lush');

      const okay = getCompanionStatus('tea_plant', 70);
      expect(okay.icon).toBe('🌱');
      expect(okay.tier).toBe('okay');
      expect(okay.status).toBe('Doing Okay');

      const struggling = getCompanionStatus('tea_plant', 30);
      expect(struggling.icon).toBe('🥀');
      expect(struggling.tier).toBe('struggling');
      expect(struggling.status).toBe('Needs Gentle Care');
    });

    it('returns proper tiers, labels, and icons for chicken', () => {
      const thriving = getCompanionStatus('chicken', 90);
      expect(thriving.icon).toBe('🐔');
      expect(thriving.tier).toBe('thriving');
      expect(thriving.status).toBe('Thriving & Content');

      const okay = getCompanionStatus('chicken', 65);
      expect(okay.icon).toBe('🐥');
      expect(okay.tier).toBe('okay');
      expect(okay.status).toBe('Doing Okay');

      const struggling = getCompanionStatus('chicken', 20);
      expect(struggling.icon).toBe('🤒');
      expect(struggling.tier).toBe('struggling');
      expect(struggling.status).toBe('Needs Gentle Care');
    });
  });

  describe('Component Rendering and In-Session Progression', () => {
    it('initializes companion health at 70% with baseline status', () => {
      render(<CareForYourCompanion onComplete={vi.fn()} />);

      // Health meter shows 70% and initial status
      expect(screen.getByText('70%')).toBeInTheDocument();
      expect(screen.getByText('Doing Okay')).toBeInTheDocument();
      expect(screen.getByText(/Chaa Bon \(Tea Plant\) Health/i)).toBeInTheDocument();
    });

    it('increases health to 85% and upgrades avatar to 🌿 upon making a correct choice', () => {
      render(<CareForYourCompanion onComplete={vi.fn()} />);

      // Step 1: Thirsty plant -> Water it gently 💧
      const waterBtn = screen.getByRole('button', { name: /Water it gently 💧/i });
      fireEvent.click(waterBtn);

      // Health increases to 85% (70 + 15)
      expect(screen.getByText('85%')).toBeInTheDocument();
      expect(screen.getByText('Thriving & Lush')).toBeInTheDocument();

      // Feedback shows health gain and thriving avatar
      expect(screen.getByText(/gained health \(\+15%\)/i)).toBeInTheDocument();
      expect(screen.getAllByText('🌿').length).toBeGreaterThan(0);
    });

    it('decreases health by 25% upon making incorrect choices and degrades avatar when below 45%', () => {
      render(<CareForYourCompanion onComplete={vi.fn()} />);

      // Step 1: Choose incorrect option (-25 health -> 45%)
      const fertilizerBtn = screen.getByRole('button', { name: /Add lots of fertilizer/i });
      fireEvent.click(fertilizerBtn);

      expect(screen.getByText('45%')).toBeInTheDocument();
      expect(screen.getByText(/lost health \(-25%\)/i)).toBeInTheDocument();

      // Advance to Step 2
      fireEvent.click(screen.getByRole('button', { name: /Next Situation →/i }));

      // Step 2: Choose another incorrect option (-25 health -> 20%)
      const wallBtn = screen.getByRole('button', { name: /Move it next to a cement wall/i });
      fireEvent.click(wallBtn);

      // Now health is 20% (<45), status should become "Needs Gentle Care" with wilted plant 🥀
      expect(screen.getByText('20%')).toBeInTheDocument();
      expect(screen.getByText('Needs Gentle Care')).toBeInTheDocument();
      expect(screen.getAllByText('🥀').length).toBeGreaterThan(0);
    });

    it('allows switching to Hen companion and resets health to 70% baseline', () => {
      render(<CareForYourCompanion onComplete={vi.fn()} />);

      // Switch to Hen companion
      const henBtn = screen.getByRole('button', { name: /Murgi \(Village Hen\)/i });
      fireEvent.click(henBtn);

      expect(screen.getByText(/Murgi \(Village Hen\) Health/i)).toBeInTheDocument();
      expect(screen.getByText('70%')).toBeInTheDocument();
      expect(screen.getByText('Doing Okay')).toBeInTheDocument();

      // Morning dawn situation for hen
      expect(screen.getByText(/Your hen hasn't eaten yet/i)).toBeInTheDocument();

      // Correct feeding choice -> +15% -> 85% -> 🐔 Thriving
      const grainBtn = screen.getByRole('button', { name: /Scatter grain and rice bran 🌾/i });
      fireEvent.click(grainBtn);

      expect(screen.getByText('85%')).toBeInTheDocument();
      expect(screen.getByText('Thriving & Content')).toBeInTheDocument();
      expect(screen.getAllByText('🐔').length).toBeGreaterThan(0);
    });

    it('completes the session across all 4 steps and invokes onComplete with companion health data', async () => {
      const handleComplete = vi.fn();
      render(<CareForYourCompanion onComplete={handleComplete} />);

      // Step 1: Correct (+15 -> 85%)
      fireEvent.click(screen.getByRole('button', { name: /Water it gently 💧/i }));
      fireEvent.click(screen.getByRole('button', { name: /Next Situation →/i }));

      // Step 2: Correct (+15 -> 100%)
      fireEvent.click(screen.getByRole('button', { name: /Put a shade cloth over it 🌿/i }));
      fireEvent.click(screen.getByRole('button', { name: /Next Situation →/i }));

      // Step 3: Correct (+15 -> 100% capped)
      fireEvent.click(screen.getByRole('button', { name: /Apply safe plant medicine 🧴/i }));
      fireEvent.click(screen.getByRole('button', { name: /Next Situation →/i }));

      // Step 4: Correct
      fireEvent.click(screen.getByRole('button', { name: /Cover it with a light cloth for the night 🌿/i }));
      fireEvent.click(screen.getByRole('button', { name: /See Results →/i }));

      await waitFor(() => {
        expect(handleComplete).toHaveBeenCalledTimes(1);
      });

      expect(handleComplete).toHaveBeenCalledWith(
        expect.objectContaining({
          score: 100,
          maxScore: 100,
          companionHealth: 100,
          subtext: expect.stringContaining('Final health: 100%')
        })
      );
    });
  });
});
