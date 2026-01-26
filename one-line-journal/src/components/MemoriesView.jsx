import { useEffect, useState } from 'react';
import { format } from 'date-fns';
import './MemoriesView.css';

export function MemoriesView({ journalDay, getMemories, onReturnToToday }) {
  const [memories, setMemories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMemories();
  }, [journalDay]);

  async function loadMemories() {
    setLoading(true);
    try {
      const entries = await getMemories();
      setMemories(entries);
    } catch (error) {
      console.error('Error loading memories:', error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="memories-view">
        <div className="memories-header">
          <h2>Loading memories...</h2>
        </div>
      </div>
    );
  }

  // Format title as "Memories from 24 January"
  const date = new Date(journalDay + 'T12:00:00');
  const memoriesTitle = `Memories from ${format(date, 'd MMMM')}`;

  return (
    <div className="memories-view">
      <div className="memories-header">
        <h2>{memoriesTitle}</h2>
        <button onClick={onReturnToToday} className="return-button">
          Return to Today
        </button>
      </div>

      {memories.length === 0 ? (
        <div className="empty-memories">
          <p className="empty-message">
            This is your first entry for this day of the year!
          </p>
          <p className="empty-hint">
            Come back next year to see your memories from today.
          </p>
        </div>
      ) : (
        <div className="memories-list">
          {memories.map((memory) => {
            const memoryDate = new Date(memory.journalDay + 'T12:00:00');
            const dayOfWeek = format(memoryDate, 'EEEE');

            return (
              <div key={memory.journalDay} className="memory-item">
                <div className="memory-year">
                  {memory.year} <span className="memory-day">({dayOfWeek})</span>
                </div>
                <p className="memory-text">{memory.text}</p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
