import { useState } from 'react';
import { getWorkoutsByDate, deleteWorkout } from '../utils/storage';
import CardioForm from './CardioForm';
import WeightsForm from './WeightsForm';
import FreeTextForm from './FreeTextForm';

const ACTIVITY_LABELS = {
  cardio: { label: 'Cardio', color: 'bg-red-500', icon: '🏃' },
  weights: { label: 'Weights', color: 'bg-blue-500', icon: '🏋️' },
  hockey: { label: 'Hockey', color: 'bg-green-500', icon: '🏒' },
  other: { label: 'Other', color: 'bg-yellow-500', icon: '📝' }
};

const DayDetail = ({ date, onClose, onWorkoutChange }) => {
  const [workouts, setWorkouts] = useState(() => getWorkoutsByDate(date));
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedType, setSelectedType] = useState(null);
  const [editingWorkout, setEditingWorkout] = useState(null);

  const refreshWorkouts = () => {
    setWorkouts(getWorkoutsByDate(date));
    onWorkoutChange();
  };

  const handleDelete = (id) => {
    if (confirm('Delete this workout?')) {
      deleteWorkout(id);
      refreshWorkouts();
    }
  };

  const handleFormClose = () => {
    setShowAddForm(false);
    setSelectedType(null);
    setEditingWorkout(null);
    refreshWorkouts();
  };

  const formatWorkoutSummary = (workout) => {
    const { type, data } = workout;

    switch (type) {
      case 'cardio':
        return `${data.activityType} - ${data.duration} min (${data.intensity})`;
      case 'weights':
        const totalSets = data.exercises.reduce((sum, ex) => sum + ex.sets.length, 0);
        return `${data.routineName} - ${totalSets} sets`;
      case 'hockey':
      case 'other':
        return data.description.substring(0, 50) + (data.description.length > 50 ? '...' : '');
      default:
        return '';
    }
  };

  const formatDate = (dateStr) => {
    const d = new Date(dateStr + 'T00:00:00');
    return d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
  };

  // Show form for selected activity type
  if (showAddForm && selectedType) {
    const FormComponent = {
      cardio: CardioForm,
      weights: WeightsForm,
      hockey: FreeTextForm,
      other: FreeTextForm
    }[selectedType];

    return (
      <FormComponent
        date={date}
        type={selectedType}
        workout={editingWorkout}
        onClose={handleFormClose}
      />
    );
  }

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
          <h2 className="text-lg font-semibold">{formatDate(date)}</h2>
          <div className="w-10"></div>
        </div>

        {/* Existing Workouts */}
        {workouts.length > 0 && (
          <div className="mb-6">
            <h3 className="text-sm text-slate-400 mb-3">Logged Activities</h3>
            <div className="space-y-2">
              {workouts.map(workout => {
                const config = ACTIVITY_LABELS[workout.type];
                return (
                  <div
                    key={workout.id}
                    className="bg-slate-800 rounded-lg p-3 flex items-center gap-3"
                  >
                    <div className={`w-10 h-10 ${config.color} rounded-lg flex items-center justify-center text-lg`}>
                      {config.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium">{config.label}</div>
                      <div className="text-sm text-slate-400 truncate">
                        {formatWorkoutSummary(workout)}
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <button
                        onClick={() => {
                          setEditingWorkout(workout);
                          setSelectedType(workout.type);
                          setShowAddForm(true);
                        }}
                        className="p-2 hover:bg-slate-700 rounded-lg text-slate-400"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleDelete(workout.id)}
                        className="p-2 hover:bg-slate-700 rounded-lg text-red-400"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Add Activity */}
        <div>
          <h3 className="text-sm text-slate-400 mb-3">
            {workouts.length > 0 ? 'Add Another Activity' : 'Log an Activity'}
          </h3>
          <div className="grid grid-cols-2 gap-3">
            {Object.entries(ACTIVITY_LABELS).map(([type, config]) => (
              <button
                key={type}
                onClick={() => {
                  setSelectedType(type);
                  setShowAddForm(true);
                }}
                className={`${config.color} bg-opacity-20 hover:bg-opacity-30 border border-opacity-50 rounded-xl p-4 flex flex-col items-center gap-2 transition-all`}
                style={{ borderColor: `var(--tw-${config.color})` }}
              >
                <span className="text-2xl">{config.icon}</span>
                <span className="font-medium">{config.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DayDetail;
