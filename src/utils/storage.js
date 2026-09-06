/**
 * storage.js - LocalStorage progress tracker for NeuroSetu Cognitive Training Suite
 * 
 * Tracks per-game completion, best score, times played, and last played timestamp.
 * Fully client-side with safe fallback if localStorage is disabled.
 */

const STORAGE_KEY = 'neurosetu_cognitive_progress_v1';

/**
 * Get all progress records from localStorage
 * @returns {Record<string, { completed: boolean, bestScore: number, timesPlayed: number, lastPlayed: string }>}
 */
export function getAllProgress() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    return JSON.parse(raw);
  } catch (err) {
    console.warn('LocalStorage error reading progress:', err);
    return {};
  }
}

/**
 * Get progress for a specific game
 * @param {string} gameId 
 * @returns {{ completed: boolean, bestScore: number, timesPlayed: number, lastPlayed?: string } | null}
 */
export function getGameProgress(gameId) {
  const all = getAllProgress();
  return all[gameId] || null;
}

/**
 * Save / update game score and completion
 * @param {string} gameId 
 * @param {number} score - Score achieved (e.g. 100)
 * @param {object} [metadata] - Additional metadata like accuracy, difficulty
 * @returns {{ completed: boolean, bestScore: number, timesPlayed: number, isNewBest: boolean }}
 */
export function saveGameScore(gameId, score = 100, metadata = {}) {
  try {
    const all = getAllProgress();
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
    localStorage.setItem(STORAGE_KEY, JSON.stringify(all));

    // Dispatch custom event so Hub or other components can react immediately
    window.dispatchEvent(new CustomEvent('neurosetu:progress-updated', { detail: { gameId, progress: updated } }));

    return { ...updated, isNewBest };
  } catch (err) {
    console.warn('LocalStorage error saving progress:', err);
    return { completed: true, bestScore: score, timesPlayed: 1, isNewBest: true };
  }
}

/**
 * Reset all game progress
 */
export function clearAllProgress() {
  try {
    localStorage.removeItem(STORAGE_KEY);
    window.dispatchEvent(new CustomEvent('neurosetu:progress-updated', { detail: {} }));
  } catch (err) {
    console.warn('LocalStorage error clearing progress:', err);
  }
}
