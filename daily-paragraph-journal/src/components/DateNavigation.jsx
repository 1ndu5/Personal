import { format, addDays, subDays } from 'date-fns';
import { getJournalDay, isJournalDayInFuture } from '../utils/dateHelpers';
import './DateNavigation.css';

export function DateNavigation({ currentJournalDay, onNavigate }) {
  const handlePrevious = () => {
    const prevDay = format(subDays(new Date(currentJournalDay + 'T12:00:00'), 1), 'yyyy-MM-dd');
    onNavigate(prevDay);
  };

  const handleNext = () => {
    const nextDay = format(addDays(new Date(currentJournalDay + 'T12:00:00'), 1), 'yyyy-MM-dd');
    if (!isJournalDayInFuture(nextDay)) {
      onNavigate(nextDay);
    }
  };

  const handleToday = () => {
    onNavigate(getJournalDay());
  };

  const isToday = currentJournalDay === getJournalDay();
  const nextDay = format(addDays(new Date(currentJournalDay + 'T12:00:00'), 1), 'yyyy-MM-dd');
  const canGoNext = !isJournalDayInFuture(nextDay);

  return (
    <div className="date-navigation">
      <button onClick={handlePrevious} className="nav-button" title="Previous day">
        ← Previous
      </button>

      {!isToday && (
        <button onClick={handleToday} className="nav-button today-button">
          Today
        </button>
      )}

      <button
        onClick={handleNext}
        className="nav-button"
        disabled={!canGoNext}
        title="Next day"
      >
        Next →
      </button>
    </div>
  );
}
