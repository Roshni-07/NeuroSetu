import { openDB } from 'idb';

const DB_NAME = 'NeuroSetuDB';
const DB_VERSION = 1;

export const STORES = {
  PROFILES: 'profiles',
  GAME_SESSIONS: 'game_sessions',
  TELEMETRY_LOGS: 'telemetry_logs',
  SYNC_QUEUE: 'sync_queue'
};

let dbPromise = null;

/**
 * Initialize or open the IndexedDB database instance
 */
export async function getDB() {
  if (!dbPromise) {
    dbPromise = openDB(DB_NAME, DB_VERSION, {
      upgrade(db, oldVersion, newVersion, transaction) {
        // Store 1: Patient Profiles
        if (!db.objectStoreNames.contains(STORES.PROFILES)) {
          const profileStore = db.createObjectStore(STORES.PROFILES, { keyPath: 'id' });
          profileStore.createIndex('by-created', 'createdAt');
        }

        // Store 2: Game Sessions
        if (!db.objectStoreNames.contains(STORES.GAME_SESSIONS)) {
          const sessionStore = db.createObjectStore(STORES.GAME_SESSIONS, { keyPath: 'id' });
          sessionStore.createIndex('by-profile', 'profileId');
          sessionStore.createIndex('by-completed', 'completedAt');
          sessionStore.createIndex('by-game-type', 'gameType');
        }

        // Store 3: Digital Biomarkers & Telemetry Logs
        if (!db.objectStoreNames.contains(STORES.TELEMETRY_LOGS)) {
          const telemetryStore = db.createObjectStore(STORES.TELEMETRY_LOGS, { keyPath: 'id' });
          telemetryStore.createIndex('by-profile', 'profileId');
          telemetryStore.createIndex('by-timestamp', 'timestamp');
          telemetryStore.createIndex('by-synced', 'isSynced');
        }

        // Store 4: Background Sync Queue (Delta push to Supabase)
        if (!db.objectStoreNames.contains(STORES.SYNC_QUEUE)) {
          const syncStore = db.createObjectStore(STORES.SYNC_QUEUE, { keyPath: 'id' });
          syncStore.createIndex('by-created', 'createdAt');
          syncStore.createIndex('by-retry', 'retryCount');
        }
      }
    });
  }
  return dbPromise;
}

export const DEFAULT_DAILY_ROUTINE = [
  { id: 'morning_tea', label: 'Morning Chai', icon: '☕', time: 'Dawn (6:00 AM)', subtext: 'Dawn tea on the veranda', correctSlot: 'slot_1' },
  { id: 'garden_walk', label: 'Tending Garden', icon: '🌿', time: 'Morning (7:30 AM)', subtext: 'Watering tea plants & herbs', correctSlot: 'slot_2' },
  { id: 'morning_medicine', label: 'Taking Medicine', icon: '💊', time: 'Forenoon (9:00 AM)', subtext: 'Prescribed morning pills', correctSlot: 'slot_3' },
  { id: 'midday_lunch', label: 'Midday Meal', icon: '🍲', time: 'Afternoon (1:00 PM)', subtext: 'Rice, lentils, and garden greens', correctSlot: 'slot_4' },
  { id: 'night_rest', label: 'Night Rest', icon: '🌙', time: 'Night (9:00 PM)', subtext: 'Prayer lamp and quiet sleep', correctSlot: 'slot_5' }
];

export const DEFAULT_PROFILE = {
  id: 'default_patient',
  name: 'Bhaben Kalita',
  homeState: 'Assam',
  villageTown: 'Hajo',
  language: 'en',
  age: 72,
  familyMembers: [
    { name: 'Rumi', relationship: 'daughter' },
    { name: 'Dipak', relationship: 'son' }
  ],
  formerOccupation: 'farmer',
  favoriteFestival: 'Rongali Bihu',
  favoriteFood: 'Masor Tenga & Pitha',
  starting_difficulty_tier: 1,
  dailyRoutine: DEFAULT_DAILY_ROUTINE
};

/**
 * Save or update a patient profile
 */
export async function saveProfile(profile) {
  const db = await getDB();
  const data = {
    ...profile,
    updatedAt: new Date().toISOString()
  };
  await db.put(STORES.PROFILES, data);
  return data;
}

/**
 * Retrieve a profile by ID
 */
export async function getProfile(id) {
  const db = await getDB();
  return db.get(STORES.PROFILES, id);
}

/**
 * Retrieve active profile or fallback to defaults
 */
export async function getActiveProfile(id = 'default_patient') {
  try {
    const db = await getDB();
    const found = await db.get(STORES.PROFILES, id);
    if (found) return found;
  } catch (e) {
    console.warn('[IndexedDB] getActiveProfile fallback:', e);
  }
  return { ...DEFAULT_PROFILE, id };
}

/**
 * Check if at least one patient profile exists on this device
 */
export async function hasExistingProfile() {
  try {
    const db = await getDB();
    const count = await db.count(STORES.PROFILES);
    return count > 0;
  } catch (e) {
    return false;
  }
}

/**
 * Retrieve the first or primary stored profile
 */
export async function getFirstProfile() {
  try {
    const db = await getDB();
    const all = await db.getAll(STORES.PROFILES);
    return all.length > 0 ? all[0] : null;
  } catch (e) {
    return null;
  }
}

/**
 * Save a cognitive game session
 */
export async function saveGameSession(session) {
  const db = await getDB();
  const sessionRecord = {
    id: session.id || `session_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
    profileId: session.profileId || 'default_patient',
    gameType: session.gameType, // 'memory_recall' | 'pattern_matching' | 'sequencing'
    difficultyTier: session.difficultyTier ?? 1,
    score: session.score ?? 0,
    durationSeconds: session.durationSeconds ?? 0,
    completedAt: session.completedAt || new Date().toISOString()
  };
  await db.put(STORES.GAME_SESSIONS, sessionRecord);
  return sessionRecord;
}

/**
 * Retrieve game sessions for a profile
 */
export async function getGameSessions(profileId) {
  const db = await getDB();
  if (profileId) {
    return db.getAllFromIndex(STORES.GAME_SESSIONS, 'by-profile', profileId);
  }
  return db.getAll(STORES.GAME_SESSIONS);
}

/**
 * Save a digital biomarker telemetry record
 */
export async function saveTelemetryLog(log) {
  const db = await getDB();
  const logRecord = {
    id: log.id || `log_${Date.now()}_${Math.random().toString(36).substr(2, 8)}`,
    profileId: log.profileId || 'default_patient',
    sessionId: log.sessionId || null,
    taskType: log.taskType || 'unknown',
    latencyMs: Number(log.latencyMs) || 0,
    errorCount: Number(log.errorCount) || 0,
    prosodyScore: log.prosodyScore ?? null,
    ddaAdjustment: log.ddaAdjustment || 'none', // 'decreased' | 'increased' | 'maintained'
    timestamp: log.timestamp || new Date().toISOString(),
    isSynced: Boolean(log.isSynced),
    alertFlag: Boolean(log.alertFlag)
  };
  await db.put(STORES.TELEMETRY_LOGS, logRecord);
  return logRecord;
}

/**
 * Retrieve all unsynced telemetry logs
 */
export async function getUnsyncedTelemetry() {
  const db = await getDB();
  const allLogs = await db.getAll(STORES.TELEMETRY_LOGS);
  return allLogs.filter(log => !log.isSynced);
}

/**
 * Mark a batch of telemetry records as synced
 */
export async function markTelemetrySynced(logIds) {
  const db = await getDB();
  const tx = db.transaction(STORES.TELEMETRY_LOGS, 'readwrite');
  const store = tx.objectStore(STORES.TELEMETRY_LOGS);

  for (const id of logIds) {
    const record = await store.get(id);
    if (record) {
      record.isSynced = true;
      record.syncedAt = new Date().toISOString();
      await store.put(record);
    }
  }
  await tx.done;
  return true;
}

/**
 * Add an event to the sync queue for Supabase delta upload
 */
export async function enqueueSyncEvent(entityType, action, payload) {
  const db = await getDB();
  const syncEvent = {
    id: `sync_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
    entityType, // 'telemetry' | 'session' | 'profile'
    action, // 'insert' | 'update'
    payload,
    createdAt: new Date().toISOString(),
    retryCount: 0
  };
  await db.put(STORES.SYNC_QUEUE, syncEvent);
  return syncEvent;
}

/**
 * Get all pending events from the sync queue
 */
export async function getPendingSyncEvents() {
  const db = await getDB();
  return db.getAll(STORES.SYNC_QUEUE);
}

/**
 * Remove processed events from the sync queue
 */
export async function dequeueSyncEvents(eventIds) {
  const db = await getDB();
  const tx = db.transaction(STORES.SYNC_QUEUE, 'readwrite');
  const store = tx.objectStore(STORES.SYNC_QUEUE);

  for (const id of eventIds) {
    await store.delete(id);
  }
  await tx.done;
  return true;
}

/**
 * Clear all local database tables (used for tests and full profile resets)
 */
export async function clearAllLocalData() {
  const db = await getDB();
  const tx = db.transaction(
    [STORES.PROFILES, STORES.GAME_SESSIONS, STORES.TELEMETRY_LOGS, STORES.SYNC_QUEUE],
    'readwrite'
  );
  await Promise.all([
    tx.objectStore(STORES.PROFILES).clear(),
    tx.objectStore(STORES.GAME_SESSIONS).clear(),
    tx.objectStore(STORES.TELEMETRY_LOGS).clear(),
    tx.objectStore(STORES.SYNC_QUEUE).clear()
  ]);
  await tx.done;
}

/**
 * Close database connection (for testing teardowns)
 */
export async function closeDB() {
  if (dbPromise) {
    const db = await dbPromise;
    db.close();
    dbPromise = null;
  }
}
