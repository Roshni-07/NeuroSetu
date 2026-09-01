import {
  saveTelemetryLog,
  getDB,
  STORES,
  enqueueSyncEvent,
  markTelemetrySynced
} from '../db/indexedDb.js';

/**
 * Telemetry & Digital Biomarker Recording Service
 * Silently records cognitive indicators: response latency, consecutive errors, and DDA state transitions.
 */

const LATENCY_ALERT_THRESHOLD_MS = 15000; // 15 seconds threshold for cognitive delay flag

/**
 * Record a single cognitive biomarker event
 */
export async function recordBiomarkerEvent({
  profileId = 'default_patient',
  sessionId = null,
  taskType = 'general_recall',
  latencyMs = 0,
  errorCount = 0,
  prosodyScore = null,
  ddaAdjustment = 'none',
  alertFlag = null
}) {
  const safeLatency = Math.max(0, Number(latencyMs) || 0);
  const safeErrorCount = Math.max(0, Number(errorCount) || 0);

  const isEmergencyOrAlert = alertFlag === true ||
    taskType === 'sos_emergency' ||
    safeLatency >= LATENCY_ALERT_THRESHOLD_MS ||
    safeErrorCount >= 2;

  const logEntry = {
    id: `bio_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
    profileId,
    sessionId,
    taskType,
    latencyMs: safeLatency,
    errorCount: safeErrorCount,
    prosodyScore: prosodyScore !== null ? Number(prosodyScore) : null,
    ddaAdjustment, // 'decreased' | 'increased' | 'maintained'
    timestamp: new Date().toISOString(),
    isSynced: false,
    alertFlag: isEmergencyOrAlert
  };

  // 1. Save to local IndexedDB telemetry store
  await saveTelemetryLog(logEntry);

  // 2. Enqueue to background sync queue for Supabase delta upload
  await enqueueSyncEvent('telemetry', 'insert', logEntry);

  return logEntry;
}

/**
 * Retrieve recent biomarker events for a patient profile
 */
export async function getRecentBiomarkers(profileId, limit = 20) {
  const db = await getDB();
  const allLogs = await db.getAll(STORES.TELEMETRY_LOGS);
  const filtered = profileId
    ? allLogs.filter(log => log.profileId === profileId)
    : allLogs;

  // Sort descending by timestamp
  filtered.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  return filtered.slice(0, limit);
}

/**
 * Calculate aggregated summary metrics and clinical triage flags
 */
export async function getBiomarkerSummary(profileId) {
  const logs = await getRecentBiomarkers(profileId, 100);

  if (logs.length === 0) {
    return {
      totalEvents: 0,
      averageLatencyMs: 0,
      totalErrors: 0,
      ddaDecreasedCount: 0,
      activeAlerts: 0,
      trendStatus: 'insufficient_data' // 'stable' | 'needs_attention' | 'declining'
    };
  }

  const totalLatency = logs.reduce((sum, item) => sum + item.latencyMs, 0);
  const totalErrors = logs.reduce((sum, item) => sum + item.errorCount, 0);
  const ddaDecreasedCount = logs.filter(item => item.ddaAdjustment === 'decreased').length;
  const activeAlerts = logs.filter(item => item.alertFlag).length;
  const avgLatency = Math.round(totalLatency / logs.length);

  let trendStatus = 'stable';
  if (activeAlerts >= 3 || avgLatency > 12000) {
    trendStatus = 'needs_attention';
  }

  return {
    totalEvents: logs.length,
    averageLatencyMs: avgLatency,
    totalErrors,
    ddaDecreasedCount,
    activeAlerts,
    trendStatus
  };
}

/**
 * Mark synced events
 */
export async function acknowledgeSync(logIds) {
  return markTelemetrySynced(logIds);
}
