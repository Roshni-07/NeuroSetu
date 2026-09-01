import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import {
  recordBiomarkerEvent,
  getRecentBiomarkers,
  getBiomarkerSummary,
  acknowledgeSync
} from '../../src/services/telemetryService.js';
import {
  clearAllLocalData,
  closeDB,
  getPendingSyncEvents,
  getUnsyncedTelemetry
} from '../../src/db/indexedDb.js';

describe('Task 10 & 11: Telemetry & Digital Biomarker Service', () => {
  beforeEach(async () => {
    await clearAllLocalData();
  });

  afterEach(async () => {
    await closeDB();
  });

  it('1. Records a biomarker event to IndexedDB and enqueues to sync_queue', async () => {
    const event = await recordBiomarkerEvent({
      profileId: 'patient_ner_01',
      taskType: 'bihu_instrument_recall',
      latencyMs: 3500,
      errorCount: 0,
      prosodyScore: 0.82,
      ddaAdjustment: 'maintained'
    });

    expect(event.id).toBeDefined();
    expect(event.alertFlag).toBe(false);

    // Verify it is in unsynced telemetry
    const unsynced = await getUnsyncedTelemetry();
    expect(unsynced.length).toBe(1);
    expect(unsynced[0].taskType).toBe('bihu_instrument_recall');

    // Verify it is enqueued in sync_queue
    const syncQueue = await getPendingSyncEvents();
    expect(syncQueue.length).toBe(1);
    expect(syncQueue[0].payload.id).toBe(event.id);
  });

  it('2. Flags alertFlag when response latency exceeds 15 seconds threshold', async () => {
    const slowEvent = await recordBiomarkerEvent({
      profileId: 'patient_ner_01',
      taskType: 'puan_textile_match',
      latencyMs: 16500, // 16.5s delay
      errorCount: 1,
      ddaAdjustment: 'decreased'
    });

    expect(slowEvent.alertFlag).toBe(true);
  });

  it('3. Flags alertFlag when error count reaches 2 or more', async () => {
    const errorSpikeEvent = await recordBiomarkerEvent({
      profileId: 'patient_ner_01',
      taskType: 'daily_tea_routine',
      latencyMs: 4000,
      errorCount: 2,
      ddaAdjustment: 'decreased'
    });

    expect(errorSpikeEvent.alertFlag).toBe(true);
  });

  it('4. Aggregates biomarker summary and assesses trend status', async () => {
    // Record 3 events
    await recordBiomarkerEvent({
      profileId: 'patient_002',
      latencyMs: 4000,
      errorCount: 0,
      ddaAdjustment: 'maintained'
    });

    await recordBiomarkerEvent({
      profileId: 'patient_002',
      latencyMs: 16000, // Alert 1
      errorCount: 2,    // Alert 2
      ddaAdjustment: 'decreased'
    });

    await recordBiomarkerEvent({
      profileId: 'patient_002',
      latencyMs: 17000, // Alert 3
      errorCount: 2,
      ddaAdjustment: 'decreased'
    });

    const summary = await getBiomarkerSummary('patient_002');
    expect(summary.totalEvents).toBe(3);
    expect(summary.ddaDecreasedCount).toBe(2);
    expect(summary.activeAlerts).toBe(2);
    expect(summary.averageLatencyMs).toBeGreaterThan(12000);
    expect(summary.trendStatus).toBe('needs_attention');
  });

  it('5. Acknowledges sync by marking telemetry records as synced', async () => {
    const event = await recordBiomarkerEvent({
      profileId: 'patient_003',
      latencyMs: 2500,
      errorCount: 0
    });

    const unsyncedBefore = await getUnsyncedTelemetry();
    expect(unsyncedBefore.length).toBe(1);

    await acknowledgeSync([event.id]);

    const unsyncedAfter = await getUnsyncedTelemetry();
    expect(unsyncedAfter.length).toBe(0);
  });
});
