import { parseJournalDay } from './dateHelpers';

const DB_NAME = 'OneLineJournalDB';
const DB_VERSION = 1;
const STORE_NAME = 'entries';

/**
 * Open IndexedDB connection
 */
function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;

      // Create object store with journalDay as keyPath
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const objectStore = db.createObjectStore(STORE_NAME, { keyPath: 'journalDay' });

        // Create compound index on (month, day) for "this day in history" queries
        objectStore.createIndex('monthDay', ['month', 'day'], { unique: false });
      }
    };
  });
}

/**
 * Add or update an entry
 */
export async function addEntry(journalDay, text) {
  const db = await openDB();
  const { year, month, day } = parseJournalDay(journalDay);

  const entry = {
    journalDay,
    text,
    createdAt: Date.now(),
    year,
    month,
    day,
  };

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readwrite');
    const objectStore = transaction.objectStore(STORE_NAME);
    const request = objectStore.put(entry);

    request.onsuccess = () => resolve(entry);
    request.onerror = () => reject(request.error);
  });
}

/**
 * Get entry for a specific journal day
 */
export async function getEntry(journalDay) {
  const db = await openDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readonly');
    const objectStore = transaction.objectStore(STORE_NAME);
    const request = objectStore.get(journalDay);

    request.onsuccess = () => resolve(request.result || null);
    request.onerror = () => reject(request.error);
  });
}

/**
 * Get all entries
 */
export async function getAllEntries() {
  const db = await openDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readonly');
    const objectStore = transaction.objectStore(STORE_NAME);
    const request = objectStore.getAll();

    request.onsuccess = () => resolve(request.result || []);
    request.onerror = () => reject(request.error);
  });
}

/**
 * Get all entries for a specific month/day combination (across all years)
 */
export async function getEntriesForMonthDay(month, day) {
  const db = await openDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readonly');
    const objectStore = transaction.objectStore(STORE_NAME);
    const index = objectStore.index('monthDay');
    const request = index.getAll([month, day]);

    request.onsuccess = () => {
      const entries = request.result || [];
      // Sort newest first (descending by year)
      entries.sort((a, b) => b.year - a.year);
      resolve(entries);
    };
    request.onerror = () => reject(request.error);
  });
}

/**
 * Delete an entry (for future use if needed)
 */
export async function deleteEntry(journalDay) {
  const db = await openDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readwrite');
    const objectStore = transaction.objectStore(STORE_NAME);
    const request = objectStore.delete(journalDay);

    request.onsuccess = () => resolve(true);
    request.onerror = () => reject(request.error);
  });
}

/**
 * Get all journal days that have entries (for calendar indicators)
 */
export async function getAllJournalDays() {
  const entries = await getAllEntries();
  return entries.map(entry => entry.journalDay);
}
