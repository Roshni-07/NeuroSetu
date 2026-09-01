import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  syncPendingTelemetry,
  onSyncStatusChange,
  initBackgroundSync
} from '../../src/services/syncManager.js';
import * as supabaseClientModule from '../../src/services/supabaseClient.js';
import {
  clearAllLocalData,
  closeDB,
  enqueueSyncEvent,
  getPendingSyncEvents,
  saveTelemetryLog,
  getUnsyncedTelemetry
} from '../../src/db/indexedDb.js';

describe('Task 13 & 14: Sync Manager & Online/Offline Delta Push to Supabase', () => {
  beforeEach(async () => {
    await clearAllLocalData();
    vi.restoreAllMocks();
  });

  afterEach(async () => {
    await closeDB();
  });

  it('1. Postpones sync when device is offline without dropping queue', async () => {
    // Mock navigator.onLine = false
    Object.defineProperty(global.navigator, 'onLine', {
      value: false,
      configurable: true,
      writable: true
    });

    await enqueueSyncEvent('telemetry', 'insert', { id: 'log_offline_1', latencyMs: 5000 });

    const result = await syncPendingTelemetry();
    expect(result.success).toBe(false);
    expect(result.reason).toBe('offline');

    // Confirm items remain in sync queue
    const pending = await getPendingSyncEvents();
    expect(pending.length).toBe(1);
    expect(pending[0].payload.id).toBe('log_offline_1');
  });

  it('2. Safely handles unconfigured Supabase credentials without throwing', async () => {
    Object.defineProperty(global.navigator, 'onLine', { value: true, configurable: true });
    vi.spyOn(supabaseClientModule, 'isSupabaseConfigured').mockReturnValue(false);

    await enqueueSyncEvent('telemetry', 'insert', { id: 'log_unconfigured_1' });

    const result = await syncPendingTelemetry();
    expect(result.success).toBe(false);
    expect(result.reason).toBe('unconfigured');

    const pending = await getPendingSyncEvents();
    expect(pending.length).toBe(1);
  });

  it('3. Flushes queued events to Supabase, dequeues queue, and marks telemetry synced', async () => {
    Object.defineProperty(global.navigator, 'onLine', { value: true, configurable: true });
    vi.spyOn(supabaseClientModule, 'isSupabaseConfigured').mockReturnValue(true);

    const mockUpsert = vi.fn().mockResolvedValue({ error: null });
    const mockFrom = vi.fn().mockReturnValue({ upsert: mockUpsert });
    vi.spyOn(supabaseClientModule, 'getSupabaseClient').mockReturnValue({
      from: mockFrom
    });

    // Seed local telemetry and sync queue
    const logRecord = await saveTelemetryLog({
      id: 'log_sync_success_1',
      profileId: 'patient_01',
      taskType: 'reminiscence_bihu',
      latencyMs: 4500,
      isSynced: false
    });

    const queuedEvent = await enqueueSyncEvent('telemetry', 'insert', logRecord);

    const statusUpdates = [];
    const unsubscribe = onSyncStatusChange((status) => statusUpdates.push(status.status));

    const syncResult = await syncPendingTelemetry();

    expect(syncResult.success).toBe(true);
    expect(syncResult.count).toBe(1);
    expect(mockFrom).toHaveBeenCalledWith('telemetry_logs');
    expect(mockUpsert).toHaveBeenCalled();

    // Confirm dequeued from sync_queue
    const remainingQueue = await getPendingSyncEvents();
    expect(remainingQueue.length).toBe(0);

    // Confirm marked as synced in local IndexedDB
    const unsynced = await getUnsyncedTelemetry();
    expect(unsynced.length).toBe(0);

    expect(statusUpdates).toContain('syncing');
    expect(statusUpdates).toContain('success');

    unsubscribe();
  });

  it('4. Handles Supabase 500/network errors by preserving queue and incrementing retryCount', async () => {
    Object.defineProperty(global.navigator, 'onLine', { value: true, configurable: true });
    vi.spyOn(supabaseClientModule, 'isSupabaseConfigured').mockReturnValue(true);

    const mockUpsert = vi.fn().mockResolvedValue({
      error: new Error('Supabase 500 Internal Server Error')
    });
    vi.spyOn(supabaseClientModule, 'getSupabaseClient').mockReturnValue({
      from: vi.fn().mockReturnValue({ upsert: mockUpsert })
    });

    await enqueueSyncEvent('telemetry', 'insert', {
      id: 'log_fail_retry_1',
      profileId: 'patient_01'
    });

    const syncResult = await syncPendingTelemetry();
    expect(syncResult.success).toBe(false);
    expect(syncResult.reason).toBe('network_or_server_error');

    // Confirm queue preserved with incremented retry count
    const pending = await getPendingSyncEvents();
    expect(pending.length).toBe(1);
    expect(pending[0].retryCount).toBeGreaterThanOrEqual(1);
  });
});
