/**
 * gameEngine.js - Cognitive Game State Machine & Errorless-Learning Controller
 * 
 * Enforces gerontological errorless-learning principles:
 * 1. Zero punitive feedback (no red 'X', no harsh buzzers).
 * 2. Gentle hints and distractor pruning on difficulty.
 * 3. Automatic rule-based DDA integration after 2 errors or >15s latency.
 * 4. Silent clinical telemetry generation.
 */

import { evaluateDifficulty, DIFFICULTY_TIERS } from './ddaEngine.js';
import { recordBiomarkerEvent } from '../services/telemetryService.js';
import { saveGameSession } from '../db/indexedDb.js';

export const GAME_STATES = {
  IDLE: 'IDLE',
  PROMPT: 'PROMPT',
  LISTENING: 'LISTENING',
  EVALUATING: 'EVALUATING',
  GENTLE_HINT: 'GENTLE_HINT',
  SUCCESS_REWARD: 'SUCCESS_REWARD',
  SESSION_COMPLETE: 'SESSION_COMPLETE'
};

export class CognitiveGameEngine {
  constructor({
    profileId = 'default_patient',
    gameType = 'memory_recall',
    initialTier = DIFFICULTY_TIERS.TIER_2,
    tasks = [],
    onStateChange = null,
    promptDurationMs = 300,
    rewardDurationMs = 1200
  } = {}) {
    this.profileId = profileId;
    this.gameType = gameType;
    this.currentTier = initialTier;
    this.tasks = tasks;
    this.currentTaskIndex = 0;
    this.state = GAME_STATES.IDLE;
    this.onStateChange = onStateChange;
    this.promptDurationMs = promptDurationMs;
    this.rewardDurationMs = rewardDurationMs;

    // Session Metrics & Tally
    this.sessionId = `game_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
    this.score = 0;
    this.consecutiveErrors = 0;
    this.consecutiveSuccesses = 0;
    this.sessionStartTime = null;
    this.taskStartTime = null;
    this.gentleHintMessage = '';
    this.eliminatedOptions = new Set();
    this._advanceTimer = null;
    this._promptTimer = null;
  }

  _setState(newState) {
    this.state = newState;
    if (this.onStateChange) {
      this.onStateChange(this.getState());
    }
  }

  getState() {
    return {
      state: this.state,
      currentTier: this.currentTier,
      currentTaskIndex: this.currentTaskIndex,
      totalTasks: this.tasks.length,
      currentTask: this.tasks[this.currentTaskIndex] || null,
      score: this.score,
      gentleHintMessage: this.gentleHintMessage,
      eliminatedOptions: Array.from(this.eliminatedOptions),
      sessionId: this.sessionId
    };
  }

  /**
   * Start the game session
   */
  startSession() {
    this.sessionStartTime = Date.now();
    this.currentTaskIndex = 0;
    this.score = 0;
    this.consecutiveErrors = 0;
    this.consecutiveSuccesses = 0;
    this._loadTask(0);
  }

  _loadTask(index) {
    if (index >= this.tasks.length) {
      this._completeSession();
      return;
    }

    this.currentTaskIndex = index;
    this.taskStartTime = Date.now();
    this.eliminatedOptions.clear();
    this.gentleHintMessage = '';
    this._setState(GAME_STATES.PROMPT);

    // Transition to LISTENING state for patient input
    if (this._promptTimer) clearTimeout(this._promptTimer);
    this._promptTimer = setTimeout(() => {
      if (this.state === GAME_STATES.PROMPT) {
        this._setState(GAME_STATES.LISTENING);
      }
    }, this.promptDurationMs);
  }

  /**
   * Submit an answer (via touch option selection or voice keyword recognition)
   * 
   * @param {string} submittedAnswer - Selected option ID or spoken keyword
   */
  async submitAnswer(submittedAnswer) {
    if (this.state !== GAME_STATES.LISTENING && this.state !== GAME_STATES.GENTLE_HINT) {
      return;
    }

    const latencyMs = Math.max(100, Date.now() - (this.taskStartTime || Date.now()));
    this._setState(GAME_STATES.EVALUATING);

    const currentTask = this.tasks[this.currentTaskIndex];
    const isCorrect = currentTask && (
      currentTask.correctAnswer === submittedAnswer ||
      (currentTask.acceptedAliases && currentTask.acceptedAliases.includes(submittedAnswer))
    );

    if (isCorrect) {
      await this._handleCorrectAnswer(latencyMs);
    } else {
      await this._handleIncorrectAnswer(submittedAnswer, latencyMs);
    }
  }

  /**
   * Trigger timeout when patient latency exceeds 15 seconds without action
   */
  async triggerLatencyTimeout() {
    if (this.state !== GAME_STATES.LISTENING) return;
    const latencyMs = Math.max(15000, Date.now() - (this.taskStartTime || Date.now()));
    await this._handleIncorrectAnswer(null, latencyMs, true);
  }

  async _handleCorrectAnswer(latencyMs) {
    this.consecutiveErrors = 0;
    this.consecutiveSuccesses += 1;
    this.score += Math.max(10, 20 - Math.floor(latencyMs / 2000));

    // Evaluate DDA for possible progression
    const ddaDecision = evaluateDifficulty(this.currentTier, {
      consecutiveErrors: 0,
      latencyMs,
      consecutiveSuccesses: this.consecutiveSuccesses
    });

    if (ddaDecision.action === 'increased') {
      this.currentTier = ddaDecision.newTier;
      this.consecutiveSuccesses = 0;
    }

    // Silently record telemetry
    await recordBiomarkerEvent({
      profileId: this.profileId,
      sessionId: this.sessionId,
      taskType: this.tasks[this.currentTaskIndex]?.id || this.gameType,
      latencyMs,
      errorCount: 0,
      prosodyScore: 0.9,
      ddaAdjustment: ddaDecision.action
    });

    this._setState(GAME_STATES.SUCCESS_REWARD);

    // Auto advance to next task after gentle celebratory pause
    if (this._advanceTimer) clearTimeout(this._advanceTimer);
    this._advanceTimer = setTimeout(() => {
      this._loadTask(this.currentTaskIndex + 1);
    }, this.rewardDurationMs);
  }

  async _handleIncorrectAnswer(submittedAnswer, latencyMs, isTimeout = false) {
    this.consecutiveErrors += 1;
    this.consecutiveSuccesses = 0;

    // Eliminate wrong option if patient made a touch choice
    if (submittedAnswer) {
      this.eliminatedOptions.add(submittedAnswer);
    }

    // Run DDA evaluation
    const ddaDecision = evaluateDifficulty(this.currentTier, {
      consecutiveErrors: this.consecutiveErrors,
      latencyMs,
      consecutiveSuccesses: 0
    });

    if (ddaDecision.action === 'decreased') {
      this.currentTier = ddaDecision.newTier;
    }

    // Record telemetry alert silently for caregiver/ASHA
    await recordBiomarkerEvent({
      profileId: this.profileId,
      sessionId: this.sessionId,
      taskType: this.tasks[this.currentTaskIndex]?.id || this.gameType,
      latencyMs,
      errorCount: this.consecutiveErrors,
      prosodyScore: null,
      ddaAdjustment: ddaDecision.action
    });

    // Provide warm, non-punitive gentle hint
    const task = this.tasks[this.currentTaskIndex];
    if (isTimeout) {
      this.gentleHintMessage = task?.hint || 'আহক, আমি আকৌ এবাৰ মনোযোগেৰে চাওঁ। (Let us look closely together.)';
    } else {
      this.gentleHintMessage = task?.gentlePrompt || 'একো নাই, আহক আমি আকৌ এবাৰ চেষ্টা কৰোঁ। (No worries, let us try again.)';
    }

    // Set errorless gentle hint state (NEVER a failure/red buzzer state)
    this._setState(GAME_STATES.GENTLE_HINT);
  }

  async _completeSession() {
    const totalDurationSeconds = Math.round((Date.now() - (this.sessionStartTime || Date.now())) / 1000);

    // Save session record in IndexedDB
    await saveGameSession({
      id: this.sessionId,
      profileId: this.profileId,
      gameType: this.gameType,
      difficultyTier: this.currentTier,
      score: this.score,
      durationSeconds: totalDurationSeconds,
      completedAt: new Date().toISOString()
    });

    this._setState(GAME_STATES.SESSION_COMPLETE);
  }

  cleanup() {
    if (this._promptTimer) clearTimeout(this._promptTimer);
    if (this._advanceTimer) clearTimeout(this._advanceTimer);
  }
}
