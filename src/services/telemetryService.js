import {
  saveTelemetryLog,
  getDB,
  STORES,
  enqueueSyncEvent,
  markTelemetrySynced,
  CANONICAL_GAME_IDS,
  normalizeGameId
} from '../db/indexedDb.js';

export { CANONICAL_GAME_IDS, normalizeGameId };

/**
 * Telemetry & Digital Biomarker Recording Service
 * Silently records cognitive indicators: response latency, consecutive errors, and DDA state transitions.
 */

const LATENCY_ALERT_THRESHOLD_MS = 15000; // 15 seconds threshold for cognitive delay flag

/**
 * Standard game session completion logger
 * Guarantees standard metrics: gameId, patientId, accuracy, responseTimeMs, errorCount, difficultyTier, sessionLevel, timestamp
 */
export async function logGameCompletion({
  gameId = 'general_recall',
  patientId = 'default_patient',
  accuracy = 100,
  responseTimeMs = 0,
  latencyMs = null,
  errorCount = 0,
  difficultyTier = 1,
  sessionLevel = 5,
  score = null,
  stars = null,
  ddaAdjustment = 'none',
  alertFlag = null,
  timestamp = null,
  sessionId = null,
  prosodyScore = null,
  // Backward compatibility prop aliases
  profileId = null,
  taskType = null,
  level = null,
  tier = null
}) {
  const canonicalGameId = normalizeGameId(gameId || taskType || 'unknown');
  const patientIdentifier = patientId || profileId || 'default_patient';
  const responseTime = Math.max(0, Number(responseTimeMs ?? latencyMs) || 0);
  const safeErrors = Math.max(0, Number(errorCount) || 0);
  
  const rawAcc = Number(accuracy);
  const safeAccuracy = Number.isFinite(rawAcc)
    ? (rawAcc <= 1 && rawAcc > 0 ? Math.round(rawAcc * 100) : Math.max(0, Math.min(100, Math.round(rawAcc))))
    : 100;

  const currentLevel = Number(sessionLevel ?? level) || 5;
  const currentTier = Number(difficultyTier ?? tier) || (currentLevel <= 3 ? 1 : currentLevel <= 7 ? 2 : 3);

  const isEmergencyOrAlert = alertFlag === true ||
    canonicalGameId === 'sos_emergency' ||
    responseTime >= LATENCY_ALERT_THRESHOLD_MS ||
    safeErrors >= 2;

  const logEntry = {
    id: `telemetry_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
    gameId: canonicalGameId,
    patientId: patientIdentifier,
    accuracy: safeAccuracy,
    responseTimeMs: responseTime,
    errorCount: safeErrors,
    difficultyTier: currentTier,
    sessionLevel: currentLevel,
    score: score !== null ? Number(score) : safeAccuracy,
    stars: stars !== null ? Number(stars) : (safeAccuracy >= 80 ? 3 : safeAccuracy >= 50 ? 2 : 1),
    timestamp: timestamp || new Date().toISOString(),
    // Backward-compatible mirror fields
    profileId: patientIdentifier,
    sessionId: sessionId || null,
    taskType: canonicalGameId,
    latencyMs: responseTime,
    prosodyScore: prosodyScore !== null ? Number(prosodyScore) : null,
    ddaAdjustment,
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
 * Standard Telemetry alias matching requirements
 */
export const recordTelemetry = logGameCompletion;

/**
 * Record a single cognitive biomarker event (retained for backward compatibility)
 */
export async function recordBiomarkerEvent({
  profileId = 'default_patient',
  patientId = null,
  sessionId = null,
  taskType = 'general_recall',
  gameId = null,
  latencyMs = 0,
  responseTimeMs = null,
  errorCount = 0,
  prosodyScore = null,
  ddaAdjustment = 'none',
  alertFlag = null,
  accuracy = 100,
  difficultyTier = 1,
  sessionLevel = 5
}) {
  return logGameCompletion({
    gameId: gameId || taskType,
    patientId: patientId || profileId,
    responseTimeMs: responseTimeMs ?? latencyMs,
    errorCount,
    prosodyScore,
    ddaAdjustment,
    alertFlag,
    sessionId,
    accuracy,
    difficultyTier,
    sessionLevel
  });
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
