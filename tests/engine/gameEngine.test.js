import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import {
  CognitiveGameEngine,
  GAME_STATES
} from '../../src/engine/gameEngine.js';
import { DIFFICULTY_TIERS } from '../../src/engine/ddaEngine.js';
import {
  clearAllLocalData,
  closeDB,
  getGameSessions,
  getUnsyncedTelemetry
} from '../../src/db/indexedDb.js';

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

describe('Task 20 & 21: Game State Machine & Errorless Learning Tests', () => {
  beforeEach(async () => {
    await clearAllLocalData();
  });

  afterEach(async () => {
    await closeDB();
  });

  const sampleTasks = [
    {
      id: 'task_dhol_1',
      stimulus: 'বিহুত বজোৱা এই বাদ্যবিধৰ নাম কি?',
      correctAnswer: 'dhol',
      acceptedAliases: ['ঢোল', 'dhol'],
      options: ['dhol', 'pepa', 'gogona'],
      hint: 'ই কাঠ আৰু চামৰাৰে তৈয়াৰী বাদ্য। (It is made of wood and leather.)',
      gentlePrompt: 'আহক আমি আকৌ একেলগে চেষ্টা কৰোঁ। (Let us try again together.)'
    },
    {
      id: 'task_pepa_2',
      stimulus: 'ম’হৰ শিংৰে তৈয়াৰী বাদ্যবিধ কি?',
      correctAnswer: 'pepa',
      acceptedAliases: ['পেঁপা', 'pepa'],
      options: ['pepa', 'dhol', 'taal']
    }
  ];

  it('1. Initializes and transitions from IDLE to PROMPT and LISTENING', async () => {
    const engine = new CognitiveGameEngine({
      profileId: 'patient_ner_01',
      tasks: sampleTasks,
      initialTier: DIFFICULTY_TIERS.TIER_2,
      promptDurationMs: 15,
      rewardDurationMs: 20
    });

    expect(engine.state).toBe(GAME_STATES.IDLE);
    engine.startSession();
    expect(engine.state).toBe(GAME_STATES.PROMPT);

    await sleep(25);
    expect(engine.state).toBe(GAME_STATES.LISTENING);
    engine.cleanup();
  });

  it('2. Correct answer awards score, triggers SUCCESS_REWARD, and advances task', async () => {
    const engine = new CognitiveGameEngine({
      profileId: 'patient_ner_01',
      tasks: sampleTasks,
      initialTier: DIFFICULTY_TIERS.TIER_2,
      promptDurationMs: 15,
      rewardDurationMs: 25
    });

    engine.startSession();
    await sleep(25);

    // Answer with alias 'ঢোল'
    await engine.submitAnswer('ঢোল');

    expect(engine.state).toBe(GAME_STATES.SUCCESS_REWARD);
    expect(engine.score).toBeGreaterThan(0);

    // Auto advance
    await sleep(35);
    expect(engine.currentTaskIndex).toBe(1);
    engine.cleanup();
  });

  it('3. Errorless learning: Incorrect answer emits GENTLE_HINT without punitive buzzer', async () => {
    const engine = new CognitiveGameEngine({
      profileId: 'patient_ner_01',
      tasks: sampleTasks,
      initialTier: DIFFICULTY_TIERS.TIER_2,
      promptDurationMs: 15,
      rewardDurationMs: 25
    });

    engine.startSession();
    await sleep(25);

    // Pick wrong option 'pepa'
    await engine.submitAnswer('pepa');

    // Must be GENTLE_HINT, never a failure/buzz state
    expect(engine.state).toBe(GAME_STATES.GENTLE_HINT);
    expect(engine.gentleHintMessage).toContain('চেষ্টা কৰোঁ');
    expect(engine.eliminatedOptions.has('pepa')).toBe(true);

    // Consecutive errors tally is 1
    expect(engine.consecutiveErrors).toBe(1);
    expect(engine.currentTier).toBe(DIFFICULTY_TIERS.TIER_2); // Tier maintained on 1 error
    engine.cleanup();
  });

  it('4. 2 consecutive errors triggers silent DDA difficulty drop', async () => {
    const engine = new CognitiveGameEngine({
      profileId: 'patient_ner_01',
      tasks: sampleTasks,
      initialTier: DIFFICULTY_TIERS.TIER_2,
      promptDurationMs: 15,
      rewardDurationMs: 25
    });

    engine.startSession();
    await sleep(25);

    // First error
    await engine.submitAnswer('pepa');
    expect(engine.currentTier).toBe(DIFFICULTY_TIERS.TIER_2);

    // Second error
    await engine.submitAnswer('gogona');

    // DDA drop triggered silently
    expect(engine.consecutiveErrors).toBe(2);
    expect(engine.currentTier).toBe(DIFFICULTY_TIERS.TIER_1); // Dropped to Tier 1
    expect(engine.state).toBe(GAME_STATES.GENTLE_HINT);
    engine.cleanup();
  });

  it('5. Completing all tasks transitions to SESSION_COMPLETE and writes session to IndexedDB', async () => {
    const engine = new CognitiveGameEngine({
      profileId: 'patient_ner_02',
      tasks: sampleTasks,
      initialTier: DIFFICULTY_TIERS.TIER_2,
      promptDurationMs: 15,
      rewardDurationMs: 25
    });

    engine.startSession();
    await sleep(25);

    // Task 1 correct
    await engine.submitAnswer('dhol');
    await sleep(35);
    await sleep(25);

    // Task 2 correct
    await engine.submitAnswer('pepa');
    await sleep(35);

    expect(engine.state).toBe(GAME_STATES.SESSION_COMPLETE);

    // Check IndexedDB
    const sessions = await getGameSessions('patient_ner_02');
    expect(sessions.length).toBe(1);
    expect(sessions[0].score).toBeGreaterThan(0);

    const unsynced = await getUnsyncedTelemetry();
    expect(unsynced.length).toBeGreaterThanOrEqual(2);
    engine.cleanup();
  });
});
