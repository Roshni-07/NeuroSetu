import { openDB } from 'idb';

const DB_NAME = 'NeuroSetuChatDB';
const DB_VERSION = 1;
export const STORE_NAME = 'neurosetu_care_chat_messages';
export const LOCAL_STORAGE_KEY = 'neurosetu_care_chat_messages';

let dbPromise = null;

/**
 * Get or initialize IndexedDB for care chat messages
 */
export async function getChatDB() {
  if (typeof indexedDB === 'undefined') {
    return null;
  }
  if (!dbPromise) {
    dbPromise = openDB(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
          store.createIndex('by-patient', 'patientId');
          store.createIndex('by-timestamp', 'timestamp');
        }
      }
    });
  }
  return dbPromise;
}

/**
 * Read messages from localStorage fallback
 */
function getLocalStorageMessages() {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (err) {
    console.warn('[ChatStorage] localStorage read error:', err);
    return [];
  }
}

/**
 * Save messages to localStorage fallback
 */
function saveLocalStorageMessages(messages) {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(messages));
  } catch (err) {
    console.warn('[ChatStorage] localStorage write error:', err);
  }
}

/**
 * Retrieve all chat messages for a given patient ID, ordered chronologically
 * 
 * @param {string} patientId - Target patient ID
 * @returns {Promise<Array>} List of chat messages
 */
export async function getChatMessages(patientId) {
  let messages = [];
  let idbSuccess = false;

  try {
    const db = await getChatDB();
    if (db) {
      if (patientId) {
        try {
          messages = await db.getAllFromIndex(STORE_NAME, 'by-patient', patientId);
        } catch (e) {
          const all = await db.getAll(STORE_NAME);
          messages = all.filter((m) => m.patientId === patientId);
        }
      } else {
        messages = await db.getAll(STORE_NAME);
      }
      idbSuccess = true;
    }
  } catch (err) {
    console.warn('[ChatStorage] IndexedDB read error, using localStorage fallback:', err);
  }

  // If IndexedDB returned messages, synchronize to localStorage
  if (idbSuccess && messages && messages.length > 0) {
    const local = getLocalStorageMessages();
    const map = new Map();
    local.forEach((m) => map.set(m.id, m));
    messages.forEach((m) => map.set(m.id, m));
    saveLocalStorageMessages(Array.from(map.values()));
  } else {
    // Fallback to localStorage
    const local = getLocalStorageMessages();
    messages = patientId ? local.filter((m) => m.patientId === patientId) : local;
  }

  // Sort chronologically (oldest first)
  return (messages || []).sort(
    (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  );
}

/**
 * Add a new chat message
 * 
 * @param {Object} message
 * @param {string} [message.id]
 * @param {string} message.patientId
 * @param {'asha'|'caregiver'|'system'} message.senderRole
 * @param {string} message.senderName
 * @param {string} message.text
 * @param {string} [message.timestamp]
 * @param {'general'|'behavioral_flag'|'game_audit'|'visit_request'} [message.category]
 * @returns {Promise<Object>} The stored message
 */
export async function addChatMessage(message) {
  const record = {
    id: message.id || `msg_${Date.now()}_${Math.random().toString(36).substr(2, 7)}`,
    patientId: message.patientId || 'default_patient',
    senderRole: message.senderRole || 'caregiver',
    senderName: message.senderName || 'Family Caregiver',
    text: message.text || '',
    timestamp: message.timestamp || new Date().toISOString(),
    category: message.category || 'general'
  };

  // 1. Save to IndexedDB
  try {
    const db = await getChatDB();
    if (db) {
      await db.put(STORE_NAME, record);
    }
  } catch (err) {
    console.warn('[ChatStorage] IndexedDB put error:', err);
  }

  // 2. Save to localStorage fallback
  const local = getLocalStorageMessages();
  const existingIdx = local.findIndex((m) => m.id === record.id);
  if (existingIdx >= 0) {
    local[existingIdx] = record;
  } else {
    local.push(record);
  }
  saveLocalStorageMessages(local);

  return record;
}

/**
 * Clear all chat messages for a specific patient (or all if omitted)
 * 
 * @param {string} [patientId] - Target patient ID
 * @returns {Promise<boolean>}
 */
export async function clearChatForPatient(patientId) {
  // 1. Clear from IndexedDB
  try {
    const db = await getChatDB();
    if (db) {
      if (!patientId) {
        await db.clear(STORE_NAME);
      } else {
        const all = await db.getAll(STORE_NAME);
        const toDelete = all.filter((m) => m.patientId === patientId);
        const tx = db.transaction(STORE_NAME, 'readwrite');
        for (const item of toDelete) {
          await tx.objectStore(STORE_NAME).delete(item.id);
        }
        await tx.done;
      }
    }
  } catch (err) {
    console.warn('[ChatStorage] IndexedDB clear error:', err);
  }

  // 2. Clear from localStorage fallback
  if (!patientId) {
    saveLocalStorageMessages([]);
  } else {
    const local = getLocalStorageMessages();
    const updated = local.filter((m) => m.patientId !== patientId);
    saveLocalStorageMessages(updated);
  }

  return true;
}

/**
 * Format and auto-inject an automated system cognitive performance audit message
 * 
 * @param {string} patientId - Target patient identifier
 * @param {string|number} gamesCompleted - e.g., '3/3' or 3
 * @param {number} avgAccuracy - Average accuracy percentage (0-100)
 * @param {number} currentLevel - Difficulty level (1-10)
 * @returns {Promise<Object>} The generated system chat message
 */
export async function logSystemGameSummary(patientId, gamesCompleted, avgAccuracy, currentLevel) {
  const formattedGames = typeof gamesCompleted === 'number' ? `${gamesCompleted}/${gamesCompleted}` : gamesCompleted;
  const roundedAccuracy = Math.round(Number(avgAccuracy) || 0);

  const text = `[System Audit]: Patient completed ${formattedGames} games today at Level ${currentLevel}. Average accuracy: ${roundedAccuracy}%.`;

  return addChatMessage({
    patientId,
    senderRole: 'system',
    senderName: 'NeuroSetu System',
    text,
    category: 'game_audit'
  });
}

/**
 * Close chat database connection (utility for test suites)
 */
export async function closeChatDB() {
  if (dbPromise) {
    const db = await dbPromise;
    db.close();
    dbPromise = null;
  }
}
