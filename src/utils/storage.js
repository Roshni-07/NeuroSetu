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

/**
 * Get storage key for completed family games (scoped by patientId and date)
 * @param {string|null} [patientId='default_patient']
 * @param {string|null} [dateStr=null] - YYYY-MM-DD string (defaults to today)
 * @returns {string}
 */
export function getFamilyCompletionStorageKey(patientId = 'default_patient', dateStr = null) {
  const date = dateStr || new Date().toISOString().slice(0, 10);
  return `neurosetu_completed_family_${patientId || 'default_patient'}_${date}`;
}

/**
 * Get array of completed family game IDs for a patient on a specific date
 * @param {string|null} [patientId='default_patient']
 * @param {string|null} [dateStr=null]
 * @returns {string[]}
 */
export function getFamilyGameCompletion(patientId = 'default_patient', dateStr = null) {
  try {
    const key = getFamilyCompletionStorageKey(patientId, dateStr);
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : [];
  } catch (err) {
    console.warn('LocalStorage error reading family completion:', err);
    return [];
  }
}

/**
 * Save family game completion for a patient on a specific date
 * @param {string|null} [patientId='default_patient']
 * @param {string} gameId
 * @param {string|null} [dateStr=null]
 * @returns {string[]} Updated array of completed family game IDs
 */
export function saveFamilyGameCompletion(patientId = 'default_patient', gameId, dateStr = null) {
  try {
    const key = getFamilyCompletionStorageKey(patientId, dateStr);
    const existing = getFamilyGameCompletion(patientId, dateStr);
    if (!existing.includes(gameId)) {
      const updated = [...existing, gameId];
      localStorage.setItem(key, JSON.stringify(updated));
      window.dispatchEvent(new CustomEvent('neurosetu:family-progress-updated', {
        detail: { patientId: patientId || 'default_patient', gameId, completed: updated }
      }));
      return updated;
    }
    return existing;
  } catch (err) {
    console.warn('LocalStorage error saving family completion:', err);
    return [gameId];
  }
}

