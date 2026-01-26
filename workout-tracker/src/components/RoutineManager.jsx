import { useState, useEffect } from 'react';
import { getRoutines, saveRoutine, updateRoutine, deleteRoutine } from '../utils/storage';
import RoutineForm from './RoutineForm';

const RoutineManager = ({ onClose }) => {
  const [routines, setRoutines] = useState([]);
  const [editingRoutine, setEditingRoutine] = useState(null);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    loadRoutines();
  }, []);

  const loadRoutines = () => {
    setRoutines(getRoutines());
  };

  const handleDelete = (id) => {
    if (confirm('Delete this routine? This will not affect logged workouts.')) {
      deleteRoutine(id);
      loadRoutines();
    }
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditingRoutine(null);
    loadRoutines();
  };

  if (showForm) {
    return (
      <RoutineForm
        routine={editingRoutine}
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
          <h2 className="text-lg font-semibold">Manage Routines</h2>
          <button
            onClick={() => setShowForm(true)}
            className="p-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </button>
        </div>

        {/* Routines List */}
        {routines.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-4xl mb-4">🏋️</div>
            <h3 className="text-lg font-medium mb-2">No Routines Yet</h3>
            <p className="text-slate-400 mb-6">Create your first workout routine to get started</p>
            <button
              onClick={() => setShowForm(true)}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-medium transition-colors"
            >
              Create Routine
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {routines.map(routine => (
              <div
                key={routine.id}
                className="bg-slate-800 rounded-lg p-4"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-medium text-lg">{routine.name}</h3>
                    <p className="text-sm text-slate-400 mt-1">
                      {routine.exercises.length} exercise{routine.exercises.length !== 1 ? 's' : ''}
                    </p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {routine.exercises.slice(0, 4).map((ex, idx) => (
                        <span
                          key={idx}
                          className="text-xs bg-slate-700 px-2 py-1 rounded"
                        >
                          {ex.name} ({ex.targetSets}x)
                        </span>
                      ))}
                      {routine.exercises.length > 4 && (
                        <span className="text-xs text-slate-400 px-2 py-1">
                          +{routine.exercises.length - 4} more
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-1 ml-2">
                    <button
                      onClick={() => {
                        setEditingRoutine(routine);
                        setShowForm(true);
                      }}
                      className="p-2 hover:bg-slate-700 rounded-lg text-slate-400"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => handleDelete(routine.id)}
                      className="p-2 hover:bg-slate-700 rounded-lg text-red-400"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default RoutineManager;
