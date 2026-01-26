import { useState } from 'react';
import { getMonthData, getMonthName, formatDate, isToday } from '../utils/dateUtils';

const ACTIVITY_COLORS = {
  cardio: 'bg-red-500',
  weights: 'bg-blue-500',
  hockey: 'bg-green-500',
  other: 'bg-yellow-500'
};

const ACTIVITY_BG_COLORS = {
  cardio: 'bg-red-500/25',
  weights: 'bg-blue-500/25',
  hockey: 'bg-green-500/25',
  other: 'bg-yellow-500/25'
};

const Calendar = ({ workoutDates, onSelectDate, selectedDate, primaryActivity }) => {
  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());

  const { daysInMonth, startingDay } = getMonthData(currentYear, currentMonth);

  const goToPrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const goToNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  const goToToday = () => {
    setCurrentMonth(today.getMonth());
    setCurrentYear(today.getFullYear());
  };

  const days = [];
  const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  // Convert Sunday-based (0-6) to Monday-based (0-6)
  // Sunday (0) becomes 6, Monday (1) becomes 0, etc.
  const mondayBasedStart = startingDay === 0 ? 6 : startingDay - 1;

  // Empty cells for days before the 1st
  for (let i = 0; i < mondayBasedStart; i++) {
    days.push(<div key={`empty-${i}`} className="h-14"></div>);
  }

  // Actual days
  for (let day = 1; day <= daysInMonth; day++) {
    const dateStr = formatDate(new Date(currentYear, currentMonth, day));
    const activities = workoutDates[dateStr] || [];
    const isTodayDate = isToday(new Date(currentYear, currentMonth, day));
    const isSelected = selectedDate === dateStr;

    // Check if primary activity is logged for this day
    const hasPrimaryActivity = primaryActivity && activities.includes(primaryActivity);
    const primaryBgColor = hasPrimaryActivity ? ACTIVITY_BG_COLORS[primaryActivity] : '';

    // Filter out primary activity from dots (only show secondary activities as dots)
    const secondaryActivities = primaryActivity
      ? activities.filter(type => type !== primaryActivity)
      : activities;

    days.push(
      <button
        key={day}
        onClick={() => onSelectDate(dateStr)}
        className={`h-14 rounded-lg flex flex-col items-center justify-start pt-1 transition-all
          ${isTodayDate ? 'ring-2 ring-blue-400' : ''}
          ${isSelected ? 'bg-slate-700' : hasPrimaryActivity ? primaryBgColor : 'hover:bg-slate-800'}
        `}
      >
        <span className={`text-sm ${isTodayDate ? 'font-bold text-blue-400' : ''}`}>
          {day}
        </span>
        {secondaryActivities.length > 0 && (
          <div className="flex gap-0.5 mt-1 flex-wrap justify-center">
            {secondaryActivities.map((type, idx) => (
              <div
                key={idx}
                className={`w-2 h-2 rounded-full ${ACTIVITY_COLORS[type]}`}
              />
            ))}
          </div>
        )}
      </button>
    );
  }

  return (
    <div className="bg-slate-800 rounded-xl p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={goToPrevMonth}
          className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <div className="text-center">
          <h2 className="text-lg font-semibold">
            {getMonthName(currentMonth)} {currentYear}
          </h2>
          <button
            onClick={goToToday}
            className="text-xs text-blue-400 hover:text-blue-300"
          >
            Today
          </button>
        </div>
        <button
          onClick={goToNextMonth}
          className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* Day names */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {dayNames.map(name => (
          <div key={name} className="text-center text-xs text-slate-400 font-medium">
            {name}
          </div>
        ))}
      </div>

      {/* Days grid */}
      <div className="grid grid-cols-7 gap-1">
        {days}
      </div>

      {/* Legend */}
      <div className="flex justify-center gap-3 mt-4 text-xs text-slate-400 flex-wrap">
        {['cardio', 'weights', 'hockey', 'other'].map(type => (
          <div key={type} className="flex items-center gap-1">
            {primaryActivity === type ? (
              <div className={`w-4 h-3 rounded ${ACTIVITY_BG_COLORS[type]} border ${ACTIVITY_COLORS[type].replace('bg-', 'border-')}`}></div>
            ) : (
              <div className={`w-2 h-2 rounded-full ${ACTIVITY_COLORS[type]}`}></div>
            )}
            <span className={primaryActivity === type ? 'font-medium text-white' : ''}>
              {type.charAt(0).toUpperCase() + type.slice(1)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Calendar;
