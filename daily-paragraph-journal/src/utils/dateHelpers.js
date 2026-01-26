import { format, subDays } from 'date-fns';

/**
 * Get the journal day for a given timestamp
 * Journal days run from noon to noon
 * Before noon = previous calendar day
 * After noon = current calendar day
 */
export function getJournalDay(timestamp = Date.now()) {
  const date = new Date(timestamp);
  const hour = date.getHours();

  if (hour < 12) {
    // Before noon, belongs to previous calendar day
    const previousDay = subDays(date, 1);
    return format(previousDay, 'yyyy-MM-dd');
  } else {
    // After noon, belongs to current calendar day
    return format(date, 'yyyy-MM-dd');
  }
}

/**
 * Format a journal day for display
 * Returns format like "Wednesday, 24 January"
 */
export function formatJournalDayDisplay(journalDay) {
  const date = new Date(journalDay + 'T12:00:00'); // Parse at noon to avoid timezone issues
  return format(date, 'EEEE, d MMMM');
}

/**
 * Get contextual message for entry form
 * Returns "You're writing about today" or "You're writing about yesterday"
 */
export function getEntryMessage(timestamp = Date.now()) {
  const date = new Date(timestamp);
  const hour = date.getHours();

  if (hour < 12) {
    return "You're writing about yesterday";
  } else {
    return "You're writing about today";
  }
}

/**
 * Parse journal day to extract year, month, day
 */
export function parseJournalDay(journalDay) {
  const date = new Date(journalDay + 'T12:00:00');
  return {
    year: date.getFullYear(),
    month: date.getMonth() + 1, // 1-12
    day: date.getDate(),        // 1-31
  };
}

/**
 * Check if a journal day has already passed
 */
export function hasJournalDayPassed(journalDay) {
  const currentJournalDay = getJournalDay();
  return journalDay < currentJournalDay;
}

/**
 * Check if a journal day is in the future
 */
export function isJournalDayInFuture(journalDay) {
  const currentJournalDay = getJournalDay();
  return journalDay > currentJournalDay;
}
