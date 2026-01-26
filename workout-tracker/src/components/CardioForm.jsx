import { useState } from 'react';
import { saveWorkout, updateWorkout } from '../utils/storage';

const CARDIO_TYPES = [
  'Running',
  'Cycling',
  'Swimming',
  'Walking',
  'Elliptical',
  'Rowing',
  'Jump Rope',
  'Stair Climber',
  'Other'
];

const INTENSITIES = ['easy', 'moderate', 'hard'];

const CardioForm = ({ date, workout, onClose }) => {
  const [activityType, setActivityType] = useState(workout?.data?.activityType || CARDIO_TYPES[0]);
  const [duration, setDuration] = useState(workout?.data?.duration || '');
  const [intensity, setIntensity] = useState(workout?.data?.intensity || 'moderate');

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!duration) {
      alert('Please enter a duration');
      return;
    }

    const data = {
      activityType,
      duration: parseInt(duration),
      intensity
    };

    if (workout) {
      updateWorkout(workout.id, { data });
    } else {
      saveWorkout({ date, type: 'cardio', data });
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-900 z-50 overflow-auto">
      <form onSubmit={handleSubmit} className="p-4 max-w-lg mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <button
            type="button"
            onClick={onClose}
            className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <span className="text-xl">🏃</span>
            {workout ? 'Edit Cardio' : 'Log Cardio'}
          </h2>
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg font-medium transition-colors"
          >
            Save
          </button>
        </div>

        {/* Form Fields */}
        <div className="space-y-6">
          {/* Activity Type */}
          <div>
            <label className="block text-sm text-slate-400 mb-2">Activity Type</label>
            <select
              value={activityType}
              onChange={(e) => setActivityType(e.target.value)}
              className="w-full"
            >
              {CARDIO_TYPES.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>

          {/* Duration */}
          <div>
            <label className="block text-sm text-slate-400 mb-2">Duration (minutes)</label>
            <input
              type="number"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              placeholder="30"
              min="1"
              className="w-full"
            />
          </div>

          {/* Intensity */}
          <div>
            <label className="block text-sm text-slate-400 mb-2">Intensity</label>
            <div className="flex gap-2">
              {INTENSITIES.map(level => (
                <button
                  key={level}
                  type="button"
                  onClick={() => setIntensity(level)}
                  className={`flex-1 py-3 rounded-lg font-medium capitalize transition-colors
                    ${intensity === level
                      ? level === 'easy'
                        ? 'bg-green-600'
                        : level === 'moderate'
                          ? 'bg-yellow-600'
                          : 'bg-red-600'
                      : 'bg-slate-700 hover:bg-slate-600'
                    }
                  `}
                >
                  {level}
                </button>
              ))}
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default CardioForm;
