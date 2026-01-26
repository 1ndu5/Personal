import { useState } from 'react';
import { saveRoutine, updateRoutine } from '../utils/storage';

const RoutineForm = ({ routine, onClose }) => {
  const [name, setName] = useState(routine?.name || '');
  const [exercises, setExercises] = useState(
    routine?.exercises || [{ name: '', targetSets: 3 }]
  );

  const addExercise = () => {
    setExercises([...exercises, { name: '', targetSets: 3 }]);
  };

  const updateExercise = (index, field, value) => {
    const newExercises = [...exercises];
    newExercises[index][field] = field === 'targetSets' ? parseInt(value) || 1 : value;
    setExercises(newExercises);
  };

  const removeExercise = (index) => {
    if (exercises.length > 1) {
      setExercises(exercises.filter((_, i) => i !== index));
    }
  };

  const moveExercise = (index, direction) => {
    const newIndex = index + direction;
    if (newIndex < 0 || newIndex >= exercises.length) return;

    const newExercises = [...exercises];
    [newExercises[index], newExercises[newIndex]] = [newExercises[newIndex], newExercises[index]];
    setExercises(newExercises);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!name.trim()) {
      alert('Please enter a routine name');
      return;
    }

    const validExercises = exercises.filter(ex => ex.name.trim());
    if (validExercises.length === 0) {
      alert('Please add at least one exercise');
      return;
    }

    const routineData = {
      name: name.trim(),
      exercises: validExercises.map(ex => ({
        name: ex.name.trim(),
        targetSets: ex.targetSets
      }))
    };

    if (routine) {
      updateRoutine(routine.id, routineData);
    } else {
      saveRoutine(routineData);
    }

    onClose();
  };

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
          <h2 className="text-lg font-semibold">
            {routine ? 'Edit Routine' : 'New Routine'}
          </h2>
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg font-medium transition-colors"
          >
            Save
          </button>
        </div>

        {/* Routine Name */}
        <div className="mb-6">
          <label className="block text-sm text-slate-400 mb-2">Routine Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g., Push Day, Leg Day, Full Body"
            className="w-full"
          />
        </div>

        {/* Exercises */}
        <div>
          <label className="block text-sm text-slate-400 mb-2">Exercises</label>
          <div className="space-y-3">
            {exercises.map((exercise, index) => (
              <div
                key={index}
                className="bg-slate-800 rounded-lg p-3"
              >
                <div className="flex items-center gap-2 mb-2">
                  <div className="flex flex-col gap-1">
                    <button
                      type="button"
                      onClick={() => moveExercise(index, -1)}
                      disabled={index === 0}
                      className="p-1 text-slate-400 hover:text-white disabled:opacity-30"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                      </svg>
                    </button>
                    <button
                      type="button"
                      onClick={() => moveExercise(index, 1)}
                      disabled={index === exercises.length - 1}
                      className="p-1 text-slate-400 hover:text-white disabled:opacity-30"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                  </div>
                  <input
                    type="text"
                    value={exercise.name}
                    onChange={(e) => updateExercise(index, 'name', e.target.value)}
                    placeholder="Exercise name"
                    className="flex-1"
                  />
                  <button
                    type="button"
                    onClick={() => removeExercise(index)}
                    disabled={exercises.length === 1}
                    className="p-2 text-red-400 hover:text-red-300 disabled:opacity-30"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <div className="flex items-center gap-2 ml-8">
                  <label className="text-sm text-slate-400">Target Sets:</label>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => updateExercise(index, 'targetSets', Math.max(1, exercise.targetSets - 1))}
                      className="w-8 h-8 bg-slate-700 hover:bg-slate-600 rounded-lg flex items-center justify-center"
                    >
                      -
                    </button>
                    <span className="w-8 text-center">{exercise.targetSets}</span>
                    <button
                      type="button"
                      onClick={() => updateExercise(index, 'targetSets', exercise.targetSets + 1)}
                      className="w-8 h-8 bg-slate-700 hover:bg-slate-600 rounded-lg flex items-center justify-center"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={addExercise}
            className="mt-3 w-full py-3 border border-dashed border-slate-600 rounded-lg text-slate-400 hover:border-slate-500 hover:text-slate-300 transition-colors"
          >
            + Add Exercise
          </button>
        </div>
      </form>
    </div>
  );
};

export default RoutineForm;
