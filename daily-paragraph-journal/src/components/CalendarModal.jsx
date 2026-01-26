import { useState, useEffect } from 'react';
import {
  endOfMonth,
  format,
  addMonths,
  subMonths,
} from 'date-fns';
import { getJournalDay } from '../utils/dateHelpers';
import './CalendarModal.css';

export function CalendarModal({ isOpen, onClose, daysWithEntries, currentJournalDay, onSelectDay }) {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  useEffect(() => {
    // When opening, show the month of the current journal day
    if (isOpen && currentJournalDay) {
      setCurrentMonth(new Date(currentJournalDay + 'T12:00:00'));
    }
  }, [isOpen, currentJournalDay]);

  if (!isOpen) return null;

  const monthEnd = endOfMonth(currentMonth);
  const daysInMonth = parseInt(format(monthEnd, 'd'));
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  // Add invisible placeholders to make all months the same height (35 days = 5 weeks)
  const totalCells = 35;
  const placeholders = totalCells - daysInMonth;

  const today = new Date();
  const todayJournalDay = getJournalDay();

  const handlePreviousMonth = () => {
    setCurrentMonth(subMonths(currentMonth, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1));
  };

  const handleDayClick = (dayNumber) => {
    const checkDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), dayNumber);
    const journalDay = format(checkDate, 'yyyy-MM-dd');
    onSelectDay(journalDay);
    onClose();
  };

  const hasEntry = (dayNumber) => {
    // Check if ANY year has an entry for this month/day combination
    const monthDay = format(currentMonth, 'MM') + '-' + String(dayNumber).padStart(2, '0');
    return daysWithEntries.some(journalDay => journalDay.endsWith(monthDay));
  };

  const isTodayHighlight = (dayNumber) => {
    // Only highlight if we're viewing the current month and it's today's day number
    return (
      format(today, 'M') === format(currentMonth, 'M') &&
      format(today, 'yyyy') === format(currentMonth, 'yyyy') &&
      parseInt(format(today, 'd')) === dayNumber
    );
  };


  return (
    <div className="calendar-overlay" onClick={onClose}>
      <div className="calendar-modal" onClick={(e) => e.stopPropagation()}>
        <div className="calendar-header">
          <button onClick={onClose} className="calendar-close">
            ×
          </button>
          <h2 className="calendar-title">Memories from Yesteryear</h2>
          <div className="calendar-nav">
            <button onClick={handlePreviousMonth} className="calendar-nav-button">
              ←
            </button>
            <h2 className="calendar-month-year">
              {format(currentMonth, 'MMMM')}
            </h2>
            <button onClick={handleNextMonth} className="calendar-nav-button">
              →
            </button>
          </div>
        </div>

        <div className="calendar-grid">
          <div className="calendar-days">
            {days.map((dayNumber) => {
              const isToday = isTodayHighlight(dayNumber);
              const hasDayEntry = hasEntry(dayNumber);

              return (
                <button
                  key={dayNumber}
                  onClick={() => handleDayClick(dayNumber)}
                  className={`calendar-day
                    ${isToday ? 'today-highlight' : ''}
                    ${hasDayEntry ? 'has-entry' : ''}
                  `}
                >
                  <span className="day-number">{dayNumber}</span>
                  {hasDayEntry && <span className="entry-indicator">●</span>}
                </button>
              );
            })}
            {/* Add invisible placeholders to keep calendar height consistent */}
            {Array.from({ length: placeholders }, (_, i) => (
              <div key={`placeholder-${i}`} className="calendar-day-placeholder" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
