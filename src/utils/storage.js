/**
 * storage.js - LocalStorage progress tracker for NeuroSetu Cognitive Training Suite
 * 
 * Tracks per-game completion, best score, times played, and last played timestamp.
 * Fully client-side with safe fallback if localStorage is disabled.
 */

const BASE_STORAGE_KEY = 'neurosetu_cognitive_progress_v1';

/**
 * Get the localStorage key for a specific patient ID or the legacy base key
 */
export function getProgressStorageKey(patientId = null) {
  return patientId ? `${BASE_STORAGE_KEY}_${patientId}` : BASE_STORAGE_KEY;
}

/**
 * Get all progress records from localStorage, scoped by patientId
 * @param {string|null} [patientId] - Optional patient identifier
 * @returns {Record<string, { completed: boolean, bestScore: number, timesPlayed: number, lastPlayed: string }>}
 */
export function getAllProgress(patientId = null) {
  try {
    const key = getProgressStorageKey(patientId);
    const raw = localStorage.getItem(key);
    if (raw) return JSON.parse(raw);

    // Backward-compatible migration:
    // If patientId is provided but no scoped key exists yet,
    // check if legacy unkeyed data exists.
    if (patientId) {
      const legacyRaw = localStorage.getItem(BASE_STORAGE_KEY);
      if (legacyRaw) {
        if (patientId === 'preset-1' || patientId === 'default_patient') {
          const legacyData = JSON.parse(legacyRaw);
          localStorage.setItem(key, JSON.stringify(legacyData));
          return legacyData;
        }
      }
      return {};
    }

    return {};
  } catch (err) {
    console.warn('LocalStorage error reading progress:', err);
    return {};
  }
}

/**
 * Get progress for a specific game and patient
 * @param {string} gameId 
 * @param {string|null} [patientId]
 * @returns {{ completed: boolean, bestScore: number, timesPlayed: number, lastPlayed?: string } | null}
 */
export function getGameProgress(gameId, patientId = null) {
  const all = getAllProgress(patientId);
  return all[gameId] || null;
}

/**
 * Save / update game score and completion for a specific patient
 * @param {string} gameId 
 * @param {number} score - Score achieved (e.g. 100)
 * @param {object} [metadata] - Additional metadata like accuracy, difficulty
 * @param {string|null} [patientId] - Patient ID to scope progress to
 * @returns {{ completed: boolean, bestScore: number, timesPlayed: number, isNewBest: boolean }}
 */
export function saveGameScore(gameId, score = 100, metadata = {}, patientId = null) {
  try {
    const key = getProgressStorageKey(patientId);
    const all = getAllProgress(patientId);
    const existing = all[gameId] || {
      completed: false,
      bestScore: 0,
      timesPlayed: 0
    };

    const isNewBest = score > (existing.bestScore || 0);
    const updated = {
      completed: true,
      bestScore: Math.max(existing.bestScore || 0, score),
      timesPlayed: (existing.timesPlayed || 0) + 1,
      lastPlayed: new Date().toISOString(),
      metadata: { ...(existing.metadata || {}), ...metadata }
    };

    all[gameId] = updated;
    localStorage.setItem(key, JSON.stringify(all));

    // Dispatch custom event so Hub or other components can react immediately
    window.dispatchEvent(new CustomEvent('neurosetu:progress-updated', { detail: { gameId, progress: updated, patientId } }));

    return { ...updated, isNewBest };
  } catch (err) {
    console.warn('LocalStorage error saving progress:', err);
    return { completed: true, bestScore: score, timesPlayed: 1, isNewBest: true };
  }
}

/**
 * Reset game progress (for specific patient or all)
 * @param {string|null} [patientId]
 */
export function clearAllProgress(patientId = null) {
  try {
    const key = getProgressStorageKey(patientId);
    localStorage.removeItem(key);
    if (!patientId) {
      localStorage.removeItem(BASE_STORAGE_KEY);
    }
    window.dispatchEvent(new CustomEvent('neurosetu:progress-updated', { detail: { patientId } }));
  } catch (err) {
    console.warn('LocalStorage error clearing progress:', err);
  }
}
