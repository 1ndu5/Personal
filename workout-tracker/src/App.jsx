import { useState, useEffect } from 'react';
import Calendar from './components/Calendar';
import DayDetail from './components/DayDetail';
import Settings from './components/Settings';
import { getWorkoutDates, getSettings } from './utils/storage';
import { formatDate } from './utils/dateUtils';

function App() {
  const [selectedDate, setSelectedDate] = useState(null);
  const [workoutDates, setWorkoutDates] = useState({});
  const [showSettings, setShowSettings] = useState(false);
  const [settings, setSettings] = useState(() => getSettings());

  useEffect(() => {
    refreshWorkoutDates();
  }, []);

  const refreshWorkoutDates = () => {
    setWorkoutDates(getWorkoutDates());
  };

  const refreshSettings = () => {
    setSettings(getSettings());
  };

  const handleSelectDate = (date) => {
    setSelectedDate(date);
  };

  const handleCloseDetail = () => {
    setSelectedDate(null);
  };

  return (
    <div className="min-h-screen bg-slate-900 pb-20">
      {/* Header */}
      <header className="bg-slate-800 px-4 py-4 sticky top-0 z-10">
        <div className="max-w-lg mx-auto flex items-center justify-between">
          <h1 className="text-xl font-bold flex items-center gap-2">
            <span>💪</span>
            Workout Tracker
          </h1>
          <button
            onClick={() => setShowSettings(true)}
            className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
            title="Settings"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-lg mx-auto p-4">
        <Calendar
          workoutDates={workoutDates}
          onSelectDate={handleSelectDate}
          selectedDate={selectedDate}
          primaryActivity={settings.primaryActivity}
        />

        {/* Quick Log Button */}
        <button
          onClick={() => setSelectedDate(formatDate(new Date()))}
          className="mt-4 w-full py-4 bg-blue-600 hover:bg-blue-700 rounded-xl font-medium text-lg transition-colors flex items-center justify-center gap-2"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Log Today's Workout
        </button>
      </main>

      {/* Day Detail Modal */}
      {selectedDate && (
        <DayDetail
          date={selectedDate}
          onClose={handleCloseDetail}
          onWorkoutChange={refreshWorkoutDates}
        />
      )}

      {/* Settings Modal */}
      {showSettings && (
        <Settings
          onClose={() => setShowSettings(false)}
          onDataChange={refreshWorkoutDates}
          onSettingsChange={refreshSettings}
        />
      )}
    </div>
  );
}

export default App;
