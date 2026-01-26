import { useState } from 'react';
import RoutineManager from './RoutineManager';
import { getSettings, saveSettings } from '../utils/storage';

const ACTIVITY_OPTIONS = [
  { value: null, label: 'None', description: 'Show all activities as dots' },
  { value: 'cardio', label: 'Cardio', color: 'bg-red-500' },
  { value: 'weights', label: 'Weights', color: 'bg-blue-500' },
  { value: 'hockey', label: 'Hockey', color: 'bg-green-500' },
  { value: 'other', label: 'Other', color: 'bg-yellow-500' }
];

const Settings = ({ onClose, onDataChange, onSettingsChange }) => {
  const [showRoutineManager, setShowRoutineManager] = useState(false);
  const [importStatus, setImportStatus] = useState(null);
  const [settings, setSettings] = useState(() => getSettings());

  const handlePrimaryActivityChange = (value) => {
    const updated = saveSettings({ primaryActivity: value });
    setSettings(updated);
    onSettingsChange?.();
  };

  const handleExport = () => {
    const data = {
      version: 1,
      exportedAt: new Date().toISOString(),
      workouts: JSON.parse(localStorage.getItem('workout-tracker-workouts') || '[]'),
      routines: JSON.parse(localStorage.getItem('workout-tracker-routines') || '[]')
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `workout-data-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleImport = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target.result);

        // Validate structure
        if (!data.workouts || !data.routines) {
          throw new Error('Invalid file format');
        }

        // Confirm before overwriting
        if (confirm('This will replace all your current data. Are you sure?')) {
          localStorage.setItem('workout-tracker-workouts', JSON.stringify(data.workouts));
          localStorage.setItem('workout-tracker-routines', JSON.stringify(data.routines));
          setImportStatus({ type: 'success', message: 'Data imported successfully!' });
          onDataChange();
        }
      } catch (err) {
        setImportStatus({ type: 'error', message: 'Failed to import: Invalid file format' });
      }
    };
    reader.readAsText(file);

    // Reset file input
    e.target.value = '';
  };

  const handleClearData = () => {
    if (confirm('This will delete ALL your workout data and routines. This cannot be undone. Are you sure?')) {
      if (confirm('Are you REALLY sure? All data will be lost.')) {
        localStorage.removeItem('workout-tracker-workouts');
        localStorage.removeItem('workout-tracker-routines');
        setImportStatus({ type: 'success', message: 'All data cleared' });
        onDataChange();
      }
    }
  };

  if (showRoutineManager) {
    return (
      <RoutineManager
        onClose={() => setShowRoutineManager(false)}
        embedded={true}
      />
    );
  }

  const workoutCount = JSON.parse(localStorage.getItem('workout-tracker-workouts') || '[]').length;
  const routineCount = JSON.parse(localStorage.getItem('workout-tracker-routines') || '[]').length;

  return (
    <div className="fixed inset-0 bg-slate-900 z-50 overflow-auto">
      <div className="p-4 max-w-lg mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h2 className="text-lg font-semibold">Settings</h2>
          <div className="w-10"></div>
        </div>

        {/* Status Message */}
        {importStatus && (
          <div className={`mb-4 p-3 rounded-lg ${
            importStatus.type === 'success' ? 'bg-green-900/50 text-green-300' : 'bg-red-900/50 text-red-300'
          }`}>
            {importStatus.message}
          </div>
        )}

        {/* Routines Section */}
        <div className="mb-6">
          <h3 className="text-sm text-slate-400 mb-3">Weight Routines</h3>
          <button
            onClick={() => setShowRoutineManager(true)}
            className="w-full bg-slate-800 hover:bg-slate-700 rounded-lg p-4 flex items-center justify-between transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <div className="text-left">
                <div className="font-medium">Manage Routines</div>
                <div className="text-sm text-slate-400">{routineCount} routine{routineCount !== 1 ? 's' : ''}</div>
              </div>
            </div>
            <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        {/* Calendar Display Section */}
        <div className="mb-6">
          <h3 className="text-sm text-slate-400 mb-3">Calendar Display</h3>
          <div className="bg-slate-800 rounded-lg p-4">
            <div className="mb-3">
              <div className="font-medium mb-1">Primary Activity</div>
              <div className="text-sm text-slate-400 mb-3">
                Days with this activity will have a colored background
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {ACTIVITY_OPTIONS.map((option) => (
                <button
                  key={option.value || 'none'}
                  onClick={() => handlePrimaryActivityChange(option.value)}
                  className={`p-3 rounded-lg text-left transition-colors flex items-center gap-2
                    ${settings.primaryActivity === option.value
                      ? 'bg-slate-600 ring-2 ring-blue-400'
                      : 'bg-slate-700 hover:bg-slate-600'
                    }
                  `}
                >
                  {option.color && (
                    <div className={`w-3 h-3 rounded-full ${option.color}`}></div>
                  )}
                  <span className="font-medium">{option.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Data Management Section */}
        <div className="mb-6">
          <h3 className="text-sm text-slate-400 mb-3">Data Management</h3>
          <div className="bg-slate-800 rounded-lg overflow-hidden">
            {/* Data Stats */}
            <div className="p-4 border-b border-slate-700">
              <div className="text-sm text-slate-400 mb-1">Current Data</div>
              <div className="font-medium">{workoutCount} workout{workoutCount !== 1 ? 's' : ''} logged</div>
            </div>

            {/* Export */}
            <button
              onClick={handleExport}
              className="w-full p-4 flex items-center gap-3 hover:bg-slate-700 transition-colors border-b border-slate-700"
            >
              <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
              </svg>
              <div className="text-left">
                <div className="font-medium">Export Data</div>
                <div className="text-sm text-slate-400">Download all workouts and routines as JSON</div>
              </div>
            </button>

            {/* Import */}
            <label className="w-full p-4 flex items-center gap-3 hover:bg-slate-700 transition-colors cursor-pointer border-b border-slate-700">
              <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              <div className="text-left">
                <div className="font-medium">Import Data</div>
                <div className="text-sm text-slate-400">Restore from a backup file</div>
              </div>
              <input
                type="file"
                accept=".json"
                onChange={handleImport}
                className="hidden"
              />
            </label>

            {/* Clear Data */}
            <button
              onClick={handleClearData}
              className="w-full p-4 flex items-center gap-3 hover:bg-slate-700 transition-colors"
            >
              <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              <div className="text-left">
                <div className="font-medium text-red-400">Clear All Data</div>
                <div className="text-sm text-slate-400">Delete all workouts and routines</div>
              </div>
            </button>
          </div>
        </div>

        {/* About Section */}
        <div>
          <h3 className="text-sm text-slate-400 mb-3">About</h3>
          <div className="bg-slate-800 rounded-lg p-4">
            <div className="text-center">
              <div className="text-2xl mb-2">💪</div>
              <div className="font-medium">Workout Tracker</div>
              <div className="text-sm text-slate-400">Version 1.0.0</div>
              <div className="text-xs text-slate-500 mt-2">Data stored locally on your device</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
