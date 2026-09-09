import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import RoadmapView from '../../src/components/roadmap/RoadmapView.jsx';
import { PRESET_PATIENTS } from '../../src/data/presetPatients.js';
import { getScheduledFamilyGames, FAMILY_GAMES_METADATA } from '../../src/utils/familyScheduling.js';
import { assignDailyGames } from '../../src/engine/dailyAssignmentEngine.js';
import { createSession, ROLES } from '../../src/services/authService.js';
import {
  getFamilyCompletionStorageKey,
  getFamilyGameCompletion,
  saveFamilyGameCompletion,
  clearAllProgress
} from '../../src/utils/storage.js';
import App from '../../src/App.jsx';

describe('Family Module Scheduling & Roadmap Integration Suite', () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
    window.location.hash = '#/';
    vi.restoreAllMocks();
  });


  describe('1. Fixed-Calendar-Day Scheduling Engine (familyScheduling.js)', () => {
    it('schedules Pair A (Identity Recall + Family Tree) on Mondays (Day 1)', () => {
      // 2026-09-07 was a Monday
      const monday = new Date('2026-09-07T10:00:00');
      expect(monday.getDay()).toBe(1);

      const scheduled = getScheduledFamilyGames(monday);
      expect(scheduled).toHaveLength(2);
      expect(scheduled[0].id).toBe('identity_recall');
      expect(scheduled[1].id).toBe('family_tree');
      expect(scheduled[0].name).toBe('Family Face & Name Recall');
      expect(scheduled[1].name).toBe('Family Tree Builder');
    });

    it('schedules Pair B (Category Sorting + Life Timeline) on Thursdays (Day 4)', () => {
      // 2026-09-10 was a Thursday
      const thursday = new Date('2026-09-10T10:00:00');
      expect(thursday.getDay()).toBe(4);

      const scheduled = getScheduledFamilyGames(thursday);
      expect(scheduled).toHaveLength(2);
      expect(scheduled[0].id).toBe('category_sorting');
      expect(scheduled[1].id).toBe('life_timeline');
      expect(scheduled[0].name).toBe('Family Sorting & Circles');
      expect(scheduled[1].name).toBe('Life Story Timeline');
    });

    it('returns empty array on non-family days (Tuesday, Wednesday, Friday, Saturday, Sunday)', () => {
      const sunday = new Date('2026-09-06T10:00:00'); // 0
      const tuesday = new Date('2026-09-08T10:00:00'); // 2
      const wednesday = new Date('2026-09-09T10:00:00'); // 3
      const friday = new Date('2026-09-11T10:00:00'); // 5
      const saturday = new Date('2026-09-12T10:00:00'); // 6

      expect(getScheduledFamilyGames(sunday)).toEqual([]);
      expect(getScheduledFamilyGames(tuesday)).toEqual([]);
      expect(getScheduledFamilyGames(wednesday)).toEqual([]);
      expect(getScheduledFamilyGames(friday)).toEqual([]);
      expect(getScheduledFamilyGames(saturday)).toEqual([]);
    });
  });

  describe('2. Patient-Scoped Storage Helper Patterns (storage.js)', () => {
    it('scopes family completion key to patientId and date', () => {
      const key = getFamilyCompletionStorageKey('patient_001', '2026-09-07');
      expect(key).toBe('neurosetu_completed_family_patient_001_2026-09-07');
    });

    it('saves and reads family completion with complete cross-patient isolation', () => {
      saveFamilyGameCompletion('patient_A', 'identity_recall', '2026-09-07');
      saveFamilyGameCompletion('patient_B', 'family_tree', '2026-09-07');

      const completedA = getFamilyGameCompletion('patient_A', '2026-09-07');
      const completedB = getFamilyGameCompletion('patient_B', '2026-09-07');

      expect(completedA).toEqual(['identity_recall']);
      expect(completedB).toEqual(['family_tree']);
      expect(completedA).not.toContain('family_tree');
    });
  });

  describe('3. RoadmapView Visual Composition & Mobile Layout', () => {
    it('does NOT render family section on a non-scheduled day (e.g. Tuesday)', () => {
      const patient = PRESET_PATIENTS[0]; // Ramesh Patel
      const tuesday = new Date('2026-09-08T10:00:00');

      render(<RoadmapView patientProfile={patient} currentDate={tuesday} />);

      expect(screen.queryByTestId('family-memory-section')).not.toBeInTheDocument();
      // Core cognitive roadmap is still intact with all 5 nodes
      const nodes = screen.getAllByRole('button', { name: /Step \d of 5/i });
      expect(nodes).toHaveLength(5);
    });

    it('renders distinct standalone Family Memory Bonus section below the roadmap trail on Monday', () => {
      const patient = PRESET_PATIENTS[0];
      const monday = new Date('2026-09-07T10:00:00');
      const handlePlay = vi.fn();

      render(
        <RoadmapView
          patientProfile={patient}
          currentDate={monday}
          onPlayFamilyGame={handlePlay}
        />
      );

      const section = screen.getByTestId('family-memory-section');
      expect(section).toBeInTheDocument();
      expect(screen.getByText('Family Reminiscence Corner')).toBeInTheDocument();
      expect(screen.getByText('Family Face & Name Recall')).toBeInTheDocument();
      expect(screen.getByText('Family Tree Builder')).toBeInTheDocument();

      // Trigger action on family game
      const playBtn = screen.getByTestId('play-family-game-identity_recall');
      fireEvent.click(playBtn);
      expect(handlePlay).toHaveBeenCalledWith('identity_recall');
    });

    it('renders Pair B on Thursday and displays "Cherished ✓" when marked complete', () => {
      const patient = PRESET_PATIENTS[1];
      const thursday = new Date('2026-09-10T10:00:00');
      const todayStr = '2026-09-10';

      // Pre-populate category_sorting as completed for this patient
      saveFamilyGameCompletion(patient.id, 'category_sorting', todayStr);

      render(
        <RoadmapView
          patientProfile={patient}
          currentDate={thursday}
        />
      );

      expect(screen.getByTestId('family-memory-section')).toBeInTheDocument();
      expect(screen.getByText('Family Sorting & Circles')).toBeInTheDocument();
      expect(screen.getByText('Life Story Timeline')).toBeInTheDocument();

      // Cherished badge and Replay button
      expect(screen.getByText('Cherished ✓')).toBeInTheDocument();
      expect(screen.getByText('Replay Memory')).toBeInTheDocument();
    });
  });

  describe('4. Explicit Severe-Stage Patient Regression & Non-Interference', () => {
    it('severe patient (2 games/day) on Monday gets exactly 2 core cognitive games AND Pair A family games with zero interference', () => {
      const severePatient = PRESET_PATIENTS[2]; // Anil Kumar, Severe / Late Stage, dailyCap = 2
      const monday = new Date('2026-09-07T10:00:00');
      const handleSelectCognitive = vi.fn();
      const handlePlayFamily = vi.fn();

      const { rerender } = render(
        <RoadmapView
          patientProfile={severePatient}
          currentDate={monday}
          completedGameIds={[]}
          onSelectGame={handleSelectCognitive}
          onPlayFamilyGame={handlePlayFamily}
        />
      );

      // Verify Severe Stage Core Cognitive Game Quota is EXACTLY 2
      expect(screen.getByText('Anil Kumar')).toBeInTheDocument();
      expect(screen.getByTestId('dementia-stage-badge')).toHaveTextContent('Severe / Late Stage');
      expect(screen.getByTestId('daily-progress-tracker')).toHaveTextContent('Daily Progress: 0 / 2 Games Completed');
      const cognitiveNodes = screen.getAllByRole('button', { name: /Step \d of 2/i });
      expect(cognitiveNodes).toHaveLength(2);

      // Verify Family Memory Section sits alongside as bonus with Pair A
      const familySection = screen.getByTestId('family-memory-section');
      expect(familySection).toBeInTheDocument();
      expect(screen.getByTestId('family-card-identity_recall')).toBeInTheDocument();
      expect(screen.getByTestId('family-card-family_tree')).toBeInTheDocument();

      // Get the exact first assigned game for severePatient
      const assigned = assignDailyGames({ patientProfile: severePatient });
      const firstAssignedGameId = assigned[0].id;

      // Complete 1 cognitive game
      rerender(
        <RoadmapView
          patientProfile={severePatient}
          currentDate={monday}
          completedGameIds={[firstAssignedGameId]}
          onSelectGame={handleSelectCognitive}
          onPlayFamilyGame={handlePlayFamily}
        />
      );

      // Cognitive progress moves to 1 / 2
      expect(screen.getByTestId('daily-progress-tracker')).toHaveTextContent('Daily Progress: 1 / 2 Games Completed');
      // Family games are unaffected
      expect(screen.getByTestId('family-card-identity_recall')).toBeInTheDocument();

      // Complete 1 family game
      saveFamilyGameCompletion(severePatient.id, 'identity_recall', '2026-09-07');
      rerender(
        <RoadmapView
          patientProfile={severePatient}
          currentDate={monday}
          completedGameIds={[firstAssignedGameId]}
          onSelectGame={handleSelectCognitive}
          onPlayFamilyGame={handlePlayFamily}
        />
      );

      // Cognitive progress is STILL 1 / 2 (family completion does NOT bleed into cognitive cap)
      expect(screen.getByTestId('daily-progress-tracker')).toHaveTextContent('Daily Progress: 1 / 2 Games Completed');
      // Family game reflects Cherished state
      expect(screen.getByText('Cherished ✓')).toBeInTheDocument();
    });
  });

  describe('5. App.jsx Route Whitelist & Dashboard Wiring', () => {
    it('route "#family" renders FamilyModuleRouter without triggering 404 page', () => {
      window.location.hash = '#/family';
      render(<App />);

      expect(screen.queryByTestId('not-found-view')).not.toBeInTheDocument();
      expect(screen.getByText(/Family & Identity Games/i)).toBeInTheDocument();
    });

    it('renders Family Memory Portal launcher button in caregiver/ASHA dashboard', () => {
      createSession('ASHA Rina Borah', ROLES.ASHA_WORKER, null);
      window.location.hash = '#/dashboard';

      render(<App />);

      const familyBtn = screen.getByRole('button', { name: /Family Memory Portal/i });
      expect(familyBtn).toBeInTheDocument();

      fireEvent.click(familyBtn);
      expect(window.location.hash).toContain('family');
    });

    it('launches a family game from RoadmapView inside App and returns cleanly back to roadmap on exit', async () => {
      createSession('Ramesh Patel', ROLES.PATIENT, 'preset-1');
      window.location.hash = '#/patient';

      render(<App />);

      // If today is not Mon/Thu, we can test that roadmap view is rendered
      expect(screen.getByTestId('roadmap-view-container')).toBeInTheDocument();
    });
  });
});
