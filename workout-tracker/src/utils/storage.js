import { v4 as uuidv4 } from 'uuid';

const WORKOUTS_KEY = 'workout-tracker-workouts';
const ROUTINES_KEY = 'workout-tracker-routines';
const SETTINGS_KEY = 'workout-tracker-settings';

// Workouts
export const getWorkouts = () => {
  const data = localStorage.getItem(WORKOUTS_KEY);
  return data ? JSON.parse(data) : [];
};

export const saveWorkout = (workout) => {
  const workouts = getWorkouts();
  const newWorkout = {
    ...workout,
    id: uuidv4(),
    createdAt: new Date().toISOString()
  };
  workouts.push(newWorkout);
  localStorage.setItem(WORKOUTS_KEY, JSON.stringify(workouts));
  return newWorkout;
};

export const updateWorkout = (id, updates) => {
  const workouts = getWorkouts();
  const index = workouts.findIndex(w => w.id === id);
  if (index !== -1) {
    workouts[index] = { ...workouts[index], ...updates };
    localStorage.setItem(WORKOUTS_KEY, JSON.stringify(workouts));
    return workouts[index];
  }
  return null;
};

export const deleteWorkout = (id) => {
  const workouts = getWorkouts();
  const filtered = workouts.filter(w => w.id !== id);
  localStorage.setItem(WORKOUTS_KEY, JSON.stringify(filtered));
};

export const getWorkoutsByDate = (date) => {
  const workouts = getWorkouts();
  return workouts.filter(w => w.date === date);
};

export const getWorkoutDates = () => {
  const workouts = getWorkouts();
  const dateMap = {};

  workouts.forEach(w => {
    if (!dateMap[w.date]) {
      dateMap[w.date] = new Set();
    }
    dateMap[w.date].add(w.type);
  });

  // Convert Sets to Arrays
  Object.keys(dateMap).forEach(date => {
    dateMap[date] = Array.from(dateMap[date]);
  });

  return dateMap;
};

// Routines
export const getRoutines = () => {
  const data = localStorage.getItem(ROUTINES_KEY);
  return data ? JSON.parse(data) : [];
};

export const saveRoutine = (routine) => {
  const routines = getRoutines();
  const newRoutine = {
    ...routine,
    id: uuidv4(),
    createdAt: new Date().toISOString()
  };
  routines.push(newRoutine);
  localStorage.setItem(ROUTINES_KEY, JSON.stringify(routines));
  return newRoutine;
};

export const updateRoutine = (id, updates) => {
  const routines = getRoutines();
  const index = routines.findIndex(r => r.id === id);
  if (index !== -1) {
    routines[index] = { ...routines[index], ...updates };
    localStorage.setItem(ROUTINES_KEY, JSON.stringify(routines));
    return routines[index];
  }
  return null;
};

export const deleteRoutine = (id) => {
  const routines = getRoutines();
  const filtered = routines.filter(r => r.id !== id);
  localStorage.setItem(ROUTINES_KEY, JSON.stringify(filtered));
};

export const getRoutineById = (id) => {
  const routines = getRoutines();
  return routines.find(r => r.id === id);
};

// Settings
const DEFAULT_SETTINGS = {
  primaryActivity: null // null means no primary, show all as dots
};

export const getSettings = () => {
  const data = localStorage.getItem(SETTINGS_KEY);
  return data ? { ...DEFAULT_SETTINGS, ...JSON.parse(data) } : DEFAULT_SETTINGS;
};

export const saveSettings = (settings) => {
  const current = getSettings();
  const updated = { ...current, ...settings };
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(updated));
  return updated;
};
