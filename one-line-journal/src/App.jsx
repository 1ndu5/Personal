import { useState, useEffect } from 'react';
import { useJournal } from './hooks/useJournal';
import { useTheme } from './hooks/useTheme';
import { EntryForm } from './components/EntryForm';
import { MemoriesView } from './components/MemoriesView';
import { Settings } from './components/Settings';
import { CalendarModal } from './components/CalendarModal';
import './App.css';

function App() {
  const {
    currentJournalDay,
    currentEntry,
    loading,
    saveEntry,
    getMemories,
    navigateToToday,
    navigateToDay,
    getDaysWithEntries,
    hasEntry,
  } = useJournal();

  const { currentTheme } = useTheme();

  const [view, setView] = useState('entry'); // 'entry' or 'memories'
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [daysWithEntries, setDaysWithEntries] = useState([]);

  // Apply theme to document root
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', currentTheme);
  }, [currentTheme]);

  const handleSaveEntry = async (text) => {
    await saveEntry(text);
    // After saving, show memories
    setView('memories');
  };

  const handleReturnToToday = () => {
    navigateToToday();
    setView('entry');
  };

  const handleImportComplete = () => {
    // Reload current entry after import
    navigateToToday();
  };

  const handleOpenCalendar = async () => {
    const days = await getDaysWithEntries();
    setDaysWithEntries(days);
    setIsCalendarOpen(true);
  };

  const handleSelectDay = (journalDay) => {
    navigateToDay(journalDay);
    setView('memories');
  };

  if (loading) {
    return (
      <div className="app">
        <div className="loading">Loading journal...</div>
      </div>
    );
  }

  return (
    <div className="app">
      <Settings onImportComplete={handleImportComplete} />

      <button
        onClick={handleOpenCalendar}
        className="calendar-button"
        aria-label="Memories"
      >
        M
      </button>

      <CalendarModal
        isOpen={isCalendarOpen}
        onClose={() => setIsCalendarOpen(false)}
        daysWithEntries={daysWithEntries}
        currentJournalDay={currentJournalDay}
        onSelectDay={handleSelectDay}
      />

      <header className="app-header">
      </header>

      <main className="app-main">
        {view === 'entry' ? (
          <>
            <EntryForm
              journalDay={currentJournalDay}
              onSubmit={handleSaveEntry}
              existingEntry={currentEntry}
            />
            {hasEntry && (
              <button
                onClick={() => setView('memories')}
                className="view-memories-button"
              >
                View Memories
              </button>
            )}
          </>
        ) : (
          <MemoriesView
            journalDay={currentJournalDay}
            getMemories={getMemories}
            onReturnToToday={handleReturnToToday}
          />
        )}
      </main>

      <footer className="app-footer">
        <p>Your journal is stored locally on this device</p>
      </footer>
    </div>
  );
}

export default App;
