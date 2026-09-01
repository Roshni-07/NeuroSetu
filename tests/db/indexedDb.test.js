import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import {
  getDB,
  saveProfile,
  getProfile,
  saveGameSession,
  getGameSessions,
  saveTelemetryLog,
  getUnsyncedTelemetry,
  markTelemetrySynced,
  enqueueSyncEvent,
  getPendingSyncEvents,
  dequeueSyncEvents,
  clearAllLocalData,
  closeDB,
  STORES
} from '../../src/db/indexedDb.js';

describe('Task 8 & 9: Local IndexedDB Persistence via idb', () => {
  beforeEach(async () => {
    await clearAllLocalData();
  });

  afterEach(async () => {
    await closeDB();
  });

  it('1. Initializes IndexedDB with all 4 required stores', async () => {
    const db = await getDB();
    expect(db.objectStoreNames.contains(STORES.PROFILES)).toBe(true);
    expect(db.objectStoreNames.contains(STORES.GAME_SESSIONS)).toBe(true);
    expect(db.objectStoreNames.contains(STORES.TELEMETRY_LOGS)).toBe(true);
    expect(db.objectStoreNames.contains(STORES.SYNC_QUEUE)).toBe(true);
  });

  it('2. Saves and retrieves patient profile correctly', async () => {
    const profile = {
      id: 'patient_001',
      name: 'Bhaben Kalita',
      language: 'as',
      age: 72,
      condition: 'Early MCI'
    };

    await saveProfile(profile);
    const retrieved = await getProfile('patient_001');

    expect(retrieved).not.toBeUndefined();
    expect(retrieved.name).toBe('Bhaben Kalita');
    expect(retrieved.language).toBe('as');
    expect(retrieved.updatedAt).toBeDefined();
  });

  it('3. Records game sessions and queries sessions by profile', async () => {
    const session1 = {
      id: 'sess_1',
      profileId: 'patient_001',
      gameType: 'memory_recall',
      difficultyTier: 2,
      score: 85,
      durationSeconds: 120
    };

    const session2 = {
      id: 'sess_2',
      profileId: 'patient_001',
      gameType: 'pattern_matching',
      difficultyTier: 1,
      score: 90,
      durationSeconds: 95
    };

    await saveGameSession(session1);
    await saveGameSession(session2);

    const allSessions = await getGameSessions('patient_001');
    expect(allSessions.length).toBe(2);
    expect(allSessions.map(s => s.gameType)).toContain('memory_recall');
    expect(allSessions.map(s => s.gameType)).toContain('pattern_matching');
  });

  it('4. Saves telemetry logs, filters unsynced items, and marks as synced', async () => {
    const log1 = await saveTelemetryLog({
      id: 'log_1',
      profileId: 'patient_001',
      taskType: 'bihu_recall',
      latencyMs: 4200,
      errorCount: 1,
      isSynced: false
    });

    const log2 = await saveTelemetryLog({
      id: 'log_2',
      profileId: 'patient_001',
      taskType: 'puan_matching',
      latencyMs: 3100,
      errorCount: 0,
      isSynced: true
    });

    const unsynced = await getUnsyncedTelemetry();
    expect(unsynced.length).toBe(1);
    expect(unsynced[0].id).toBe('log_1');

    // Mark log_1 as synced
    await markTelemetrySynced(['log_1']);
    const updatedUnsynced = await getUnsyncedTelemetry();
    expect(updatedUnsynced.length).toBe(0);
  });

  it('5. Enqueues and dequeues sync events for delta push', async () => {
    const event = await enqueueSyncEvent('telemetry', 'insert', { logId: 'log_1' });
    expect(event.id).toBeDefined();

    const pending = await getPendingSyncEvents();
    expect(pending.length).toBe(1);
    expect(pending[0].entityType).toBe('telemetry');

    // Dequeue event after sync confirmation
    await dequeueSyncEvents([pending[0].id]);
    const emptyQueue = await getPendingSyncEvents();
    expect(emptyQueue.length).toBe(0);
  });
});
