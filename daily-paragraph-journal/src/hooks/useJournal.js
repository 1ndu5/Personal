import { useState, useEffect } from 'react';
import { getEntry, addEntry, getEntriesForMonthDay, getAllJournalDays } from '../utils/storage';
import { getJournalDay, parseJournalDay } from '../utils/dateHelpers';

export function useJournal() {
  const [currentJournalDay, setCurrentJournalDay] = useState(getJournalDay());
  const [currentEntry, setCurrentEntry] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load current entry when journal day changes
  useEffect(() => {
    loadCurrentEntry();
  }, [currentJournalDay]);

  async function loadCurrentEntry() {
    setLoading(true);
    try {
      const entry = await getEntry(currentJournalDay);
      setCurrentEntry(entry);
    } catch (error) {
      console.error('Error loading entry:', error);
    } finally {
      setLoading(false);
    }
  }

  async function saveEntry(text) {
    try {
      const entry = await addEntry(currentJournalDay, text);
      setCurrentEntry(entry);
      return entry;
    } catch (error) {
      console.error('Error saving entry:', error);
      throw error;
    }
  }

  async function getMemories() {
    const { month, day } = parseJournalDay(currentJournalDay);
    try {
      const entries = await getEntriesForMonthDay(month, day);
      // Filter out only today's entry
      const todayJournalDay = getJournalDay();
      return entries.filter(entry => entry.journalDay !== todayJournalDay);
    } catch (error) {
      console.error('Error loading memories:', error);
      return [];
    }
  }

  async function getDaysWithEntries() {
    try {
      return await getAllJournalDays();
    } catch (error) {
      console.error('Error loading journal days:', error);
      return [];
    }
  }

  function navigateToDay(journalDay) {
    setCurrentJournalDay(journalDay);
  }

  function navigateToToday() {
    setCurrentJournalDay(getJournalDay());
  }

  return {
    currentJournalDay,
    currentEntry,
    loading,
    saveEntry,
    getMemories,
    getDaysWithEntries,
    navigateToDay,
    navigateToToday,
    hasEntry: !!currentEntry,
  };
}
