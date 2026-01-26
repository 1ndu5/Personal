import { useState } from 'react';
import { saveWorkout, updateWorkout } from '../utils/storage';

const TYPE_CONFIG = {
  hockey: { label: 'Hockey', icon: '🏒', placeholder: 'Describe your hockey session...' },
  other: { label: 'Other', icon: '📝', placeholder: 'Describe your activity...' }
};

const FreeTextForm = ({ date, type, workout, onClose }) => {
  const [description, setDescription] = useState(workout?.data?.description || '');
  const config = TYPE_CONFIG[type];

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!description.trim()) {
      alert('Please enter a description');
      return;
    }

    const data = {
      description: description.trim()
    };

    if (workout) {
      updateWorkout(workout.id, { data });
    } else {
      saveWorkout({ date, type, data });
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
            <span className="text-xl">{config.icon}</span>
            {workout ? `Edit ${config.label}` : `Log ${config.label}`}
          </h2>
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg font-medium transition-colors"
          >
            Save
          </button>
        </div>

        {/* Form Fields */}
        <div>
          <label className="block text-sm text-slate-400 mb-2">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder={config.placeholder}
            rows={6}
            className="w-full resize-none"
          />
        </div>
      </form>
    </div>
  );
};

export default FreeTextForm;
