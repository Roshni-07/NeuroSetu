import { openDB } from 'idb';

const DB_NAME = 'NeuroSetuVaultDB';
const DB_VERSION = 1;
export const STORE_NAME = 'neurosetu_family_memory_vault';
export const LOCAL_STORAGE_KEY = 'neurosetu_family_memory_vault';

let dbPromise = null;

/**
 * Get or initialize the IndexedDB instance for the Family Memory Vault
 */
export async function getVaultDB() {
  if (typeof indexedDB === 'undefined') {
    return null;
  }
  if (!dbPromise) {
    dbPromise = openDB(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
          store.createIndex('by-patient', 'patientId');
          store.createIndex('by-created', 'createdAt');
        }
      }
    });
  }
  return dbPromise;
}

/**
 * Read entries from localStorage fallback
 */
function getLocalStorageEntries() {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (err) {
    console.warn('[MemoryVaultStorage] Failed to read from localStorage:', err);
    return [];
  }
}

/**
 * Write entries to localStorage fallback
 */
function saveLocalStorageEntries(entries) {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(entries));
  } catch (err) {
    console.warn('[MemoryVaultStorage] Failed to write to localStorage:', err);
  }
}

/**
 * Retrieve all vault entries for a given patient ID
 * 
 * @param {string} [patientId] - Target patient identifier
 * @returns {Promise<Array>} List of memory vault entries
 */
export async function getVaultEntries(patientId) {
  let entries = [];
  let idbSuccess = false;

  try {
    const db = await getVaultDB();
    if (db) {
      if (patientId) {
        try {
          entries = await db.getAllFromIndex(STORE_NAME, 'by-patient', patientId);
        } catch (e) {
          const all = await db.getAll(STORE_NAME);
          entries = all.filter((item) => item.patientId === patientId);
        }
      } else {
        entries = await db.getAll(STORE_NAME);
      }
      idbSuccess = true;
    }
  } catch (err) {
    console.warn('[MemoryVaultStorage] IndexedDB read error, checking localStorage:', err);
  }

  // If IndexedDB returned entries, sync to localStorage for redundancy
  if (idbSuccess && entries && entries.length > 0) {
    const local = getLocalStorageEntries();
    const map = new Map();
    local.forEach((e) => map.set(e.id, e));
    entries.forEach((e) => map.set(e.id, e));
    saveLocalStorageEntries(Array.from(map.values()));
    return entries;
  }

  // Fallback to localStorage
  const local = getLocalStorageEntries();
  if (patientId) {
    return local.filter((item) => item.patientId === patientId);
  }
  return local;
}

/**
 * Add or update a family memory vault record
 * 
 * @param {Object} entry - Entry data
 * @param {string} [entry.id]
 * @param {string} [entry.patientId]
 * @param {string} entry.personName
 * @param {string} entry.relation
 * @param {string} entry.imageUrl
 * @param {string} [entry.audioNoteUrl]
 * @param {string} entry.clueText
 * @param {string} [entry.createdAt]
 * @returns {Promise<Object>} The saved entry
 */
export async function addVaultEntry(entry) {
  const record = {
    id: entry.id || `vault_${Date.now()}_${Math.random().toString(36).substr(2, 7)}`,
    patientId: entry.patientId || 'default_patient',
    personName: entry.personName || 'Family Member',
    relation: entry.relation || 'Custom',
    imageUrl: entry.imageUrl || '',
    audioNoteUrl: entry.audioNoteUrl || null,
    clueText: entry.clueText || '',
    createdAt: entry.createdAt || new Date().toISOString()
  };

  // 1. Save to IndexedDB
  try {
    const db = await getVaultDB();
    if (db) {
      await db.put(STORE_NAME, record);
    }
  } catch (err) {
    console.warn('[MemoryVaultStorage] IndexedDB put error:', err);
  }

  // 2. Save to localStorage fallback
  const local = getLocalStorageEntries();
  const existingIdx = local.findIndex((e) => e.id === record.id);
  if (existingIdx >= 0) {
    local[existingIdx] = record;
  } else {
    local.unshift(record);
  }
  saveLocalStorageEntries(local);

  return record;
}

/**
 * Delete a memory vault record by its unique ID
 * 
 * @param {string} id - Unique entry ID
 * @returns {Promise<boolean>} True if deletion succeeded
 */
export async function deleteVaultEntry(id) {
  // 1. Delete from IndexedDB
  try {
    const db = await getVaultDB();
    if (db) {
      await db.delete(STORE_NAME, id);
    }
  } catch (err) {
    console.warn('[MemoryVaultStorage] IndexedDB delete error:', err);
  }

  // 2. Delete from localStorage fallback
  const local = getLocalStorageEntries();
  const updated = local.filter((e) => e.id !== id);
  saveLocalStorageEntries(updated);

  return true;
}

/**
 * Clear all vault entries for a specific patient (or all if none provided)
 * 
 * @param {string} [patientId] - Target patient identifier
 * @returns {Promise<boolean>} True if cleared
 */
export async function clearVaultForPatient(patientId) {
  // 1. Clear from IndexedDB
  try {
    const db = await getVaultDB();
    if (db) {
      if (!patientId) {
        await db.clear(STORE_NAME);
      } else {
        const all = await db.getAll(STORE_NAME);
        const toDelete = all.filter((e) => e.patientId === patientId);
        const tx = db.transaction(STORE_NAME, 'readwrite');
        for (const item of toDelete) {
          await tx.objectStore(STORE_NAME).delete(item.id);
        }
        await tx.done;
      }
    }
  } catch (err) {
    console.warn('[MemoryVaultStorage] IndexedDB clear error:', err);
  }

  // 2. Clear from localStorage fallback
  if (!patientId) {
    saveLocalStorageEntries([]);
  } else {
    const local = getLocalStorageEntries();
    const updated = local.filter((e) => e.patientId !== patientId);
    saveLocalStorageEntries(updated);
  }

  return true;
}

/**
 * Close database connection (utility for test suites)
 */
export async function closeVaultDB() {
  if (dbPromise) {
    const db = await dbPromise;
    db.close();
    dbPromise = null;
  }
}
