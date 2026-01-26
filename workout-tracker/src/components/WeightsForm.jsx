import { useState, useEffect } from 'react';
import { saveWorkout, updateWorkout, getRoutines } from '../utils/storage';
import RoutineManager from './RoutineManager';

const WeightsForm = ({ date, workout, onClose }) => {
  const [routines, setRoutines] = useState([]);
  const [selectedRoutineId, setSelectedRoutineId] = useState(workout?.data?.routineId || '');
  const [exercises, setExercises] = useState(workout?.data?.exercises || []);
  const [notes, setNotes] = useState(workout?.data?.notes || '');
  const [showRoutineManager, setShowRoutineManager] = useState(false);

  useEffect(() => {
    loadRoutines();
  }, []);

  const loadRoutines = () => {
    const loadedRoutines = getRoutines();
    setRoutines(loadedRoutines);

    // If editing and routine still exists, select it
    if (workout?.data?.routineId) {
      const routineExists = loadedRoutines.find(r => r.id === workout.data.routineId);
      if (routineExists) {
        setSelectedRoutineId(workout.data.routineId);
      }
    }
  };

  const handleRoutineSelect = (routineId) => {
    setSelectedRoutineId(routineId);
    const routine = routines.find(r => r.id === routineId);
    if (routine) {
      // Initialize exercises with empty sets arrays
      setExercises(routine.exercises.map(ex => ({
        name: ex.name,
        targetSets: ex.targetSets,
        sets: workout?.data?.exercises?.find(e => e.name === ex.name)?.sets || []
      })));
    } else {
      setExercises([]);
    }
  };

  const addSet = (exerciseIndex) => {
    const newExercises = [...exercises];
    const lastSet = newExercises[exerciseIndex].sets.slice(-1)[0];
    newExercises[exerciseIndex].sets.push({
      weight: lastSet?.weight || '',
      reps: lastSet?.reps || ''
    });
    setExercises(newExercises);
  };

  const updateSet = (exerciseIndex, setIndex, field, value) => {
    const newExercises = [...exercises];
    newExercises[exerciseIndex].sets[setIndex][field] = value;
    setExercises(newExercises);
  };

  const removeSet = (exerciseIndex, setIndex) => {
    const newExercises = [...exercises];
    newExercises[exerciseIndex].sets.splice(setIndex, 1);
    setExercises(newExercises);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!selectedRoutineId) {
      alert('Please select a routine');
      return;
    }

    const routine = routines.find(r => r.id === selectedRoutineId);
    const data = {
      routineId: selectedRoutineId,
      routineName: routine.name,
      exercises: exercises.map(ex => ({
        ...ex,
        sets: ex.sets.filter(s => s.weight && s.reps).map(s => ({
          weight: parseFloat(s.weight),
          reps: parseInt(s.reps)
        }))
      })),
      notes
    };

    if (workout) {
      updateWorkout(workout.id, { data });
    } else {
      saveWorkout({ date, type: 'weights', data });
    }

    onClose();
  };

  if (showRoutineManager) {
    return (
      <RoutineManager
        onClose={() => {
          setShowRoutineManager(false);
          loadRoutines();
        }}
      />
    );
  }

  const selectedRoutine = routines.find(r => r.id === selectedRoutineId);

  return (
    <div className="fixed inset-0 bg-slate-900 z-50 overflow-auto">
      <form onSubmit={handleSubmit} className="p-4 max-w-lg mx-auto pb-20">
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
            <span className="text-xl">🏋️</span>
            {workout ? 'Edit Weights' : 'Log Weights'}
          </h2>
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg font-medium transition-colors"
          >
            Save
          </button>
        </div>

        {/* Routine Selection */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm text-slate-400">Select Routine</label>
            <button
              type="button"
              onClick={() => setShowRoutineManager(true)}
              className="text-sm text-blue-400 hover:text-blue-300"
            >
              Manage Routines
            </button>
          </div>

          {routines.length === 0 ? (
            <div className="bg-slate-800 rounded-lg p-4 text-center">
              <p className="text-slate-400 mb-3">No routines created yet</p>
              <button
                type="button"
                onClick={() => setShowRoutineManager(true)}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg font-medium transition-colors"
              >
                Create Your First Routine
              </button>
            </div>
          ) : (
            <select
              value={selectedRoutineId}
              onChange={(e) => handleRoutineSelect(e.target.value)}
              className="w-full"
            >
              <option value="">Choose a routine...</option>
              {routines.map(routine => (
                <option key={routine.id} value={routine.id}>
                  {routine.name} ({routine.exercises.length} exercises)
                </option>
              ))}
            </select>
          )}
        </div>

        {/* Exercises */}
        {selectedRoutine && (
          <div className="space-y-4 mb-6">
            <h3 className="text-sm text-slate-400">Log Your Sets</h3>

            {exercises.map((exercise, exIndex) => (
              <div key={exIndex} className="bg-slate-800 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium">{exercise.name}</h4>
                  <span className="text-sm text-slate-400">
                    Target: {exercise.targetSets} sets
                  </span>
                </div>

                {/* Sets */}
                <div className="space-y-2">
                  {exercise.sets.map((set, setIndex) => (
                    <div key={setIndex} className="flex items-center gap-2">
                      <span className="w-8 text-sm text-slate-400">{setIndex + 1}.</span>
                      <input
                        type="number"
                        value={set.weight}
                        onChange={(e) => updateSet(exIndex, setIndex, 'weight', e.target.value)}
                        placeholder="lbs"
                        className="w-20 text-center"
                      />
                      <span className="text-slate-400">x</span>
                      <input
                        type="number"
                        value={set.reps}
                        onChange={(e) => updateSet(exIndex, setIndex, 'reps', e.target.value)}
                        placeholder="reps"
                        className="w-20 text-center"
                      />
                      <button
                        type="button"
                        onClick={() => removeSet(exIndex, setIndex)}
                        className="p-1 text-red-400 hover:text-red-300"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={() => addSet(exIndex)}
                  className="mt-3 w-full py-2 border border-dashed border-slate-600 rounded-lg text-slate-400 hover:border-slate-500 hover:text-slate-300 transition-colors"
                >
                  + Add Set
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Notes */}
        {selectedRoutine && (
          <div>
            <label className="block text-sm text-slate-400 mb-2">Notes (optional)</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="How did the workout feel?"
              rows={3}
              className="w-full resize-none"
            />
          </div>
        )}
      </form>
    </div>
  );
};

export default WeightsForm;
