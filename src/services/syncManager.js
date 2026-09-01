import {
  getPendingSyncEvents,
  dequeueSyncEvents,
  markTelemetrySynced,
  getDB,
  STORES
} from '../db/indexedDb.js';
import { getSupabaseClient, isSupabaseConfigured } from './supabaseClient.js';

let isSyncInProgress = false;
let syncListeners = [];

/**
 * Register a listener for sync progress updates
 */
export function onSyncStatusChange(callback) {
  syncListeners.push(callback);
  return () => {
    syncListeners = syncListeners.filter(cb => cb !== callback);
  };
}

function notifyListeners(status) {
  syncListeners.forEach(cb => {
    try {
      cb(status);
    } catch (e) {
      console.error('[SyncManager] Listener error:', e);
    }
  });
}

/**
 * Flush all pending sync queue events to Supabase
 */
export async function syncPendingTelemetry() {
  if (isSyncInProgress) {
    return { success: false, reason: 'sync_already_in_progress' };
  }

  // Check network status
  if (typeof navigator !== 'undefined' && !navigator.onLine) {
    notifyListeners({ status: 'offline', message: 'Device is offline; sync postponed.' });
    return { success: false, reason: 'offline' };
  }

  // Check if Supabase client is configured
  if (!isSupabaseConfigured()) {
    notifyListeners({ status: 'unconfigured', message: 'Supabase unconfigured; telemetry stored safely in local IndexedDB.' });
    return { success: false, reason: 'unconfigured' };
  }

  const client = getSupabaseClient();
  if (!client) {
    return { success: false, reason: 'client_unavailable' };
  }

  isSyncInProgress = true;
  notifyListeners({ status: 'syncing', message: 'Uploading pending telemetry to Supabase...' });

  try {
    const pendingEvents = await getPendingSyncEvents();
    if (pendingEvents.length === 0) {
      isSyncInProgress = false;
      notifyListeners({ status: 'idle', message: 'Sync queue is empty.' });
      return { success: true, count: 0 };
    }

    // Separate telemetry events from other entities
    const telemetryEvents = pendingEvents.filter(e => e.entityType === 'telemetry');
    const successfulEventIds = [];
    const syncedLogIds = [];

    if (telemetryEvents.length > 0) {
      // Map local payloads to Supabase schema columns
      const payloads = telemetryEvents.map(e => ({
        id: e.payload.id,
        profile_id: e.payload.profileId,
        session_id: e.payload.sessionId,
        task_type: e.payload.taskType,
        latency_ms: e.payload.latencyMs,
        error_count: e.payload.errorCount,
        prosody_score: e.payload.prosodyScore,
        dda_adjustment: e.payload.ddaAdjustment,
        created_at: e.payload.timestamp,
        alert_flag: e.payload.alertFlag
      }));

      // Upsert into Supabase telemetry_logs table
      const { error } = await client.from('telemetry_logs').upsert(payloads, { onConflict: 'id' });

      if (error) {
        throw error;
      }

      telemetryEvents.forEach(e => {
        successfulEventIds.push(e.id);
        syncedLogIds.push(e.payload.id);
      });
    }

    // Clean up local queue and mark records as synced
    if (successfulEventIds.length > 0) {
      await dequeueSyncEvents(successfulEventIds);
      await markTelemetrySynced(syncedLogIds);
    }

    isSyncInProgress = false;
    notifyListeners({
      status: 'success',
      message: `Successfully synchronized ${successfulEventIds.length} telemetry records.`
    });

    return {
      success: true,
      count: successfulEventIds.length,
      syncedLogIds
    };
  } catch (err) {
    console.error('[SyncManager] Sync failed:', err);

    // Increment retry count for failed events
    try {
      const db = await getDB();
      const pendingEvents = await getPendingSyncEvents();
      const tx = db.transaction(STORES.SYNC_QUEUE, 'readwrite');
      const store = tx.objectStore(STORES.SYNC_QUEUE);
      for (const event of pendingEvents) {
        event.retryCount = (event.retryCount || 0) + 1;
        event.lastAttempt = new Date().toISOString();
        await store.put(event);
      }
      await tx.done;
    } catch (e) {
      // Ignore secondary error
    }

    isSyncInProgress = false;
    notifyListeners({
      status: 'error',
      message: err.message || 'Synchronization failed.'
    });

    return {
      success: false,
      error: err.message,
      reason: 'network_or_server_error'
    };
  }
}

/**
 * Initialize automatic sync listener for online events
 */
export function initBackgroundSync() {
  if (typeof window !== 'undefined') {
    window.addEventListener('online', () => {
      console.log('[SyncManager] Connection restored — initiating background sync.');
      syncPendingTelemetry();
    });
  }

  // Attempt to register with Service Worker Background Sync API if available
  if (typeof navigator !== 'undefined' && 'serviceWorker' in navigator && 'SyncManager' in window) {
    navigator.serviceWorker.ready.then(registration => {
      return registration.sync.register('neurosetu-telemetry-sync');
    }).catch(err => {
      console.log('[SyncManager] SW Background Sync not supported or rejected; standard online listener active.');
    });
  }
}
