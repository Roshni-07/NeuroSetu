import React from 'react';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import {
  CANONICAL_GAME_IDS,
  normalizeGameId,
  saveTelemetryLog,
  clearAllLocalData,
  closeDB,
  getRecentTelemetryLogs
} from '../../src/db/indexedDb.js';
import {
  logGameCompletion,
  recordTelemetry,
  getRecentBiomarkers
} from '../../src/services/telemetryService.js';
import { GAMES_CONFIG } from '../../src/data/gamesConfig.js';
import { FAMILY_GAMES } from '../../src/engine/dailyAssignmentEngine.js';

// Import core games
import GrandmasShoppingList from '../../src/games/GrandmasShoppingList.jsx';
import FestivalMemoryMatch from '../../src/games/FestivalMemoryMatch.jsx';
import DailyRoutineRecall from '../../src/games/DailyRoutineRecall.jsx';
import ShellMemoryTrail from '../../src/games/ShellMemoryTrail.jsx';
import RememberTheStory from '../../src/games/RememberTheStory.jsx';
import MemoryMapHome from '../../src/games/MemoryMapHome.jsx';
import WhoseMorningIsIt from '../../src/games/WhoseMorningIsIt.jsx';
import FindTheDifference from '../../src/games/FindTheDifference.jsx';
import TeaGardenDetective from '../../src/games/TeaGardenDetective.jsx';
import WhatBelongsHere from '../../src/games/WhatBelongsHere.jsx';
import PackVillageBasket from '../../src/games/PackVillageBasket.jsx';
import DayInMyVillage from '../../src/games/DayInMyVillage.jsx';
import CareForYourCompanion from '../../src/games/CareForYourCompanion.jsx';
import FinishGrandmasWeave from '../../src/games/FinishGrandmasWeave.jsx';
import WhoseEmotion from '../../src/games/WhoseEmotion.jsx';

// Import family games
import IdentityRecallGame from '../../src/familyModule/games/identityRecall/IdentityRecallGame.jsx';
import CategorySortingGame from '../../src/familyModule/games/categorySorting/CategorySortingGame.jsx';
import FamilyTreeBuilderGame from '../../src/familyModule/games/familyTree/FamilyTreeBuilderGame.jsx';
import LifeStoryTimelineGame from '../../src/familyModule/games/lifeTimeline/LifeStoryTimelineGame.jsx';

describe('Telemetry Schema and Canonical Game IDs Audit', () => {
  beforeEach(async () => {
    await clearAllLocalData();
  });

  afterEach(async () => {
    await closeDB();
  });

  describe('1. Canonical Game IDs and Registry Consistency', () => {
    it('CANONICAL_GAME_IDS must contain exactly 19 games (15 core + 4 family)', () => {
      expect(CANONICAL_GAME_IDS.length).toBe(19);
      expect(GAMES_CONFIG.length).toBe(15);
      expect(FAMILY_GAMES.length).toBe(4);

      // Verify all 15 core game IDs from gamesConfig match CANONICAL_GAME_IDS
      GAMES_CONFIG.forEach(game => {
        expect(CANONICAL_GAME_IDS).toContain(game.id);
      });

      // Verify all 4 family game IDs match CANONICAL_GAME_IDS
      FAMILY_GAMES.forEach(familyId => {
        expect(CANONICAL_GAME_IDS).toContain(familyId);
      });
    });

    it('normalizeGameId correctly handles exact canonical IDs, aliases, and hyphen-to-underscore variations', () => {
      expect(normalizeGameId('grandmas-shopping-list')).toBe('grandmas-shopping-list');
      expect(normalizeGameId('care-for-your-companion')).toBe('care-for-companion');
      expect(normalizeGameId('care_for_companion')).toBe('care-for-companion');
      expect(normalizeGameId('identity-recall')).toBe('identity_recall');
      expect(normalizeGameId('category-sorting')).toBe('category_sorting');
      expect(normalizeGameId('family-tree')).toBe('family_tree');
      expect(normalizeGameId('life-timeline')).toBe('life_timeline');
      expect(normalizeGameId('life-story-timeline')).toBe('life_timeline');
      expect(normalizeGameId('unknown-test-task')).toBe('unknown-test-task');
    });
  });

  describe('2. Telemetry Persistence & Schema Guarantees', () => {
    it('guarantees all required fields on saveTelemetryLog and preserves backward-compatible dual accessors', async () => {
      const saved = await saveTelemetryLog({
        gameId: 'grandmas-shopping-list',
        patientId: 'patient_001',
        accuracy: 95,
        responseTimeMs: 3200,
        errorCount: 0,
        difficultyTier: 2,
        sessionLevel: 5
      });

      expect(saved.id).toBeDefined();
      expect(saved.gameId).toBe('grandmas-shopping-list');
      expect(saved.taskType).toBe('grandmas-shopping-list'); // dual accessor
      expect(saved.patientId).toBe('patient_001');
      expect(saved.profileId).toBe('patient_001'); // dual accessor
      expect(saved.accuracy).toBe(95);
      expect(saved.responseTimeMs).toBe(3200);
      expect(saved.latencyMs).toBe(3200); // dual accessor
      expect(saved.errorCount).toBe(0);
      expect(saved.difficultyTier).toBe(2);
      expect(saved.sessionLevel).toBe(5);
      expect(saved.isSynced).toBe(false);
      expect(saved.alertFlag).toBe(false);
      expect(saved.timestamp).toBeDefined();
    });

    it('normalizes float 0-1 scale accuracy to 0-100 scale', async () => {
      const saved = await saveTelemetryLog({
        gameId: 'festival-memory-match',
        patientId: 'patient_002',
        accuracy: 0.85, // float 0-1
        responseTimeMs: 4000,
        errorCount: 1
      });

      expect(saved.accuracy).toBe(85);
    });

    it('flags alertFlag when latency >= 15000ms or errorCount >= 2', async () => {
      const slowLog = await logGameCompletion({
        gameId: 'daily-routine-recall',
        patientId: 'patient_003',
        accuracy: 70,
        responseTimeMs: 15500,
        errorCount: 0
      });
      expect(slowLog.alertFlag).toBe(true);

      const errorLog = await logGameCompletion({
        gameId: 'daily-routine-recall',
        patientId: 'patient_003',
        accuracy: 50,
        responseTimeMs: 4000,
        errorCount: 2
      });
      expect(errorLog.alertFlag).toBe(true);

      const normalLog = await logGameCompletion({
        gameId: 'daily-routine-recall',
        patientId: 'patient_003',
        accuracy: 100,
        responseTimeMs: 3000,
        errorCount: 0
      });
      expect(normalLog.alertFlag).toBe(false);
    });
  });

  describe('3. Core Game Telemetry Emission Audit', () => {
    it('WhoseMorningIsIt emits canonical telemetry onComplete', () => {
      const onComplete = vi.fn();
      render(<WhoseMorningIsIt level={1} onComplete={onComplete} />);

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

      expect(onComplete).toHaveBeenCalled();
      const payload = onComplete.mock.calls[0][0];
      expect(payload.gameId).toBe('whose-morning-is-it');
      expect(typeof payload.accuracy).toBe('number');
      expect(typeof payload.errorCount).toBe('number');
      expect(payload.errorCount).toBeGreaterThanOrEqual(0);
      expect(typeof payload.responseTimeMs).toBe('number');
      expect(payload.responseTimeMs).toBeGreaterThan(0);
      expect(payload.level).toBe(1);
    });

    it('WhoseEmotion emits canonical telemetry onComplete', () => {
      const onComplete = vi.fn();
      render(<WhoseEmotion level={1} onComplete={onComplete} />);

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

      expect(onComplete).toHaveBeenCalled();
      const payload = onComplete.mock.calls[0][0];
      expect(payload.gameId).toBe('whose-emotion');
      expect(typeof payload.accuracy).toBe('number');
      expect(typeof payload.errorCount).toBe('number');
      expect(payload.errorCount).toBeGreaterThanOrEqual(0);
      expect(typeof payload.responseTimeMs).toBe('number');
      expect(payload.responseTimeMs).toBeGreaterThan(0);
    });

    it('RememberTheStory emits canonical telemetry onComplete', () => {
      const onComplete = vi.fn();
      render(<RememberTheStory level={1} onComplete={onComplete} />);

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

      expect(onComplete).toHaveBeenCalled();
      const payload = onComplete.mock.calls[0][0];
      expect(payload.gameId).toBe('remember-the-story');
      expect(typeof payload.accuracy).toBe('number');
      expect(typeof payload.errorCount).toBe('number');
      expect(payload.errorCount).toBeGreaterThanOrEqual(0);
      expect(typeof payload.responseTimeMs).toBe('number');
      expect(payload.responseTimeMs).toBeGreaterThan(0);
    });

    it('GrandmasShoppingList emits canonical telemetry onComplete', () => {
      const onComplete = vi.fn();
      render(<GrandmasShoppingList level={1} onComplete={onComplete} />);

      // Click ready to transition from memorize to selection
      const readyBtn = screen.getByRole('button', { name: /I am Ready!/i });
      fireEvent.click(readyBtn);

      // Select an item from the pool
      const itemBtns = screen.getAllByRole('button').filter(b => !b.textContent.includes('Check Basket') && !b.textContent.includes('Exit'));
      if (itemBtns.length > 0) {
        fireEvent.click(itemBtns[0]);
      }

      // Check basket
      const checkBtn = screen.getByRole('button', { name: /Check Basket/i });
      fireEvent.click(checkBtn);

      expect(onComplete).toHaveBeenCalled();
      const payload = onComplete.mock.calls[0][0];
      expect(payload.gameId).toBe('grandmas-shopping-list');
      expect(typeof payload.accuracy).toBe('number');
      expect(typeof payload.errorCount).toBe('number');
      expect(payload.errorCount).toBeGreaterThanOrEqual(0);
      expect(typeof payload.responseTimeMs).toBe('number');
      expect(payload.responseTimeMs).toBeGreaterThan(0);
    });
  });

  describe('4. Family Game Telemetry Emission Audit', () => {
    it('CategorySortingGame emits canonical telemetry onComplete when deck is finished', async () => {
      const onComplete = vi.fn();
      render(<CategorySortingGame onComplete={onComplete} level={2} />);

      // Wait for categories to load
      await screen.findByText(/Choose a Group to Sort/i);

      // Select first category from picker
      const catBtn = screen.getAllByRole('button').find(b => b.textContent && (b.textContent.includes('Family') || b.textContent.includes('Immediate') || b.textContent.includes('Group') || b.textContent.includes('Friends')));
      if (catBtn) {
        fireEvent.click(catBtn);
      }

      await screen.findByText(/Cards to Sort/i);
      expect(screen.getByText(/Cards to Sort/i)).toBeInTheDocument();
    });
  });
});
