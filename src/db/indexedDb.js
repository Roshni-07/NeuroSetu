import { openDB } from 'idb';
import { PRESET_PATIENTS } from '../data/presetPatients.js';
import { updateMasteryScore } from '../engine/ddaEngine.js';

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
  pin: '400400',
  stage: 'Mild / Early Stage',
  sex: 'male',
  homeState: 'Assam',
  villageTown: 'Hajo',
  language: 'en',
  age: 72,
  dailyCap: 3,
  familyMembers: [
    { name: 'Rumi', relationship: 'daughter' },
    { name: 'Dipak', relationship: 'son' }
  ],
  formerOccupation: 'farmer',
  favoriteFestival: 'Rongali Bihu',
  favoriteFood: 'Masor Tenga & Pitha',
  starting_difficulty_tier: 1,
  masteryScore: 50,
  gameMasteryScores: {},
  dailyRoutine: DEFAULT_DAILY_ROUTINE
};

/**
 * Non-destructively seed preset profiles into IndexedDB.
 * Only creates a preset profile if it does not already exist, preserving
 * any caregiver edits, daily routine modifications, or updated mastery scores.
 */
export async function seedPresetProfiles() {
  try {
    const db = await getDB();
    const presetsToSeed = [
      ...PRESET_PATIENTS.map(p => ({
        ...p,
        gameMasteryScores: {},
        dailyRoutine: DEFAULT_DAILY_ROUTINE,
        createdAt: new Date().toISOString()
      })),
      {
        ...DEFAULT_PROFILE,
        createdAt: new Date().toISOString()
      }
    ];

    for (const preset of presetsToSeed) {
      const existing = await db.get(STORES.PROFILES, preset.id);
      if (!existing) {
        await db.put(STORES.PROFILES, preset);
      }
    }
  } catch (e) {
    if (e?.name !== 'InvalidStateError') {
      console.warn('[IndexedDB] seedPresetProfiles error:', e);
    }
  }
}

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
    let found = await db.get(STORES.PROFILES, id);
    if (found) return found;

    // Check preset patients list if not yet written to db
    const preset = PRESET_PATIENTS.find(p => p.id === id || p.name === id);
    if (preset) {
      const newProfile = {
        ...preset,
        gameMasteryScores: {},
        dailyRoutine: DEFAULT_DAILY_ROUTINE,
        createdAt: new Date().toISOString()
      };
      await db.put(STORES.PROFILES, newProfile);
      return newProfile;
    }

    if (id === 'default_patient') {
      const bhaben = { ...DEFAULT_PROFILE, createdAt: new Date().toISOString() };
      await db.put(STORES.PROFILES, bhaben);
      return bhaben;
    }
  } catch (e) {
    if (e?.name !== 'InvalidStateError') {
      console.warn('[IndexedDB] getActiveProfile fallback:', e);
    }
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
    profileId: session.profileId || session.patientId || 'default_patient',
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
 * Update patient mastery scores scoped per patient and per game.
 * Updates gameMasteryScores[gameId] and recomputes the aggregate profile.masteryScore.
 */
export async function updatePatientMastery(patientId, gameId, event, context = {}) {
  const db = await getDB();
  const profile = await getActiveProfile(patientId);
  const currentScores = profile.gameMasteryScores || {};
  const currentGameScore = currentScores[gameId] ?? (profile.masteryScore || 50);

  const updatedGameResult = updateMasteryScore(currentGameScore, event, context);
  const newScore = typeof updatedGameResult === 'object' ? updatedGameResult.score : updatedGameResult;

  const newGameMasteryScores = {
    ...currentScores,
    [gameId]: newScore
  };

  // Recompute aggregate patient-level mastery score
  const scores = Object.values(newGameMasteryScores);
  const aggregateScore = scores.length > 0
    ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
    : profile.masteryScore;

  const updatedProfile = {
    ...profile,
    masteryScore: aggregateScore,
    gameMasteryScores: newGameMasteryScores,
    updatedAt: new Date().toISOString()
  };

  await db.put(STORES.PROFILES, updatedProfile);
  return updatedProfile;
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
 * Canonical Game IDs dictionary and normalization map
 */
export const CANONICAL_GAME_IDS = [
  // 15 Core Games
  'grandmas-shopping-list',
  'festival-memory-match',
  'daily-routine-recall',
  'shell-memory-trail',
  'remember-the-story',
  'memory-map-home',
  'whose-morning-is-it',
  'find-the-difference',
  'tea-garden-detective',
  'what-belongs-here',
  'pack-village-basket',
  'day-in-my-village',
  'care-for-companion',
  'finish-grandmas-weave',
  'whose-emotion',
  // 4 Family & Identity Games
  'identity_recall',
  'category_sorting',
  'family_tree',
  'life_timeline'
];

const GAME_ID_ALIAS_MAP = {
  'care-for-your-companion': 'care-for-companion',
  'care_for_your_companion': 'care-for-companion',
  'care_for_companion': 'care-for-companion',
  'identity-recall': 'identity_recall',
  'category-sorting': 'category_sorting',
  'family-tree': 'family_tree',
  'family-tree-builder': 'family_tree',
  'family_tree_builder': 'family_tree',
  'life-timeline': 'life_timeline',
  'life-story-timeline': 'life_timeline',
  'life_story_timeline': 'life_timeline'
};

export function normalizeGameId(rawId) {
  if (!rawId) return 'unknown';
  const clean = String(rawId).trim();
  if (GAME_ID_ALIAS_MAP[clean]) return GAME_ID_ALIAS_MAP[clean];
  if (CANONICAL_GAME_IDS.includes(clean)) return clean;
  // Check if replacing underscores with hyphens matches core games
  const hyphenated = clean.replace(/_/g, '-');
  if (CANONICAL_GAME_IDS.includes(hyphenated)) return hyphenated;
  // Check if replacing hyphens with underscores matches family games
  const underscored = clean.replace(/-/g, '_');
  if (CANONICAL_GAME_IDS.includes(underscored)) return underscored;
  return clean;
}

/**
 * Save a digital biomarker telemetry record
 */
export async function saveTelemetryLog(log) {
  const db = await getDB();
  const rawId = log.gameId || log.taskType || 'unknown';
  const canonicalGameId = normalizeGameId(rawId);
  const patientIdentifier = log.patientId || log.profileId || 'default_patient';
  const responseTime = Math.max(0, Number(log.responseTimeMs ?? log.latencyMs) || 0);
  const safeErrors = Math.max(0, Number(log.errorCount) || 0);
  const rawAccuracy = Number(log.accuracy);
  const safeAccuracy = Number.isFinite(rawAccuracy)
    ? (rawAccuracy <= 1 && rawAccuracy > 0 ? Math.round(rawAccuracy * 100) : Math.max(0, Math.min(100, Math.round(rawAccuracy))))
    : 100;

  const sessionLvl = Number(log.sessionLevel ?? log.level) || 5;
  const diffTier = Number(log.difficultyTier ?? log.tier) || (sessionLvl <= 3 ? 1 : sessionLvl <= 7 ? 2 : 3);

  const logRecord = {
    id: log.id || `log_${Date.now()}_${Math.random().toString(36).substr(2, 8)}`,
    // Standard Guaranteed Schema
    gameId: canonicalGameId,
    patientId: patientIdentifier,
    accuracy: safeAccuracy,
    responseTimeMs: responseTime,
    errorCount: safeErrors,
    difficultyTier: diffTier,
    sessionLevel: sessionLvl,
    timestamp: log.timestamp || new Date().toISOString(),
    // Backward-Compatible Aliases & Existing Fields
    profileId: patientIdentifier,
    sessionId: log.sessionId || null,
    taskType: canonicalGameId,
    latencyMs: responseTime,
    prosodyScore: log.prosodyScore ?? null,
    ddaAdjustment: log.ddaAdjustment || 'none', // 'decreased' | 'increased' | 'maintained'
    isSynced: Boolean(log.isSynced),
    alertFlag: Boolean(log.alertFlag) || responseTime >= 15000 || safeErrors >= 2
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
