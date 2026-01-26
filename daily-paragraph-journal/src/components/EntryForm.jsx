import { useState } from 'react';
import { formatJournalDayDisplay, getEntryMessage, getJournalDay } from '../utils/dateHelpers';
import './EntryForm.css';

const MAX_CHARACTERS = 300;

export function EntryForm({ journalDay, onSubmit, existingEntry = null }) {
  const [text, setText] = useState(existingEntry?.text || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const isToday = journalDay === getJournalDay();
  const canEdit = isToday && existingEntry;
  const charactersRemaining = MAX_CHARACTERS - text.length;
  const canSubmit = text.trim().length > 0 && text.length <= MAX_CHARACTERS;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!canSubmit) return;

    setIsSubmitting(true);
    try {
      await onSubmit(text);
      setIsEditing(false);
    } catch (error) {
      console.error('Error submitting entry:', error);
      alert('Failed to save entry. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    setText(existingEntry?.text || '');
    setIsEditing(false);
  };

  const handleTextChange = (e) => {
    const newText = e.target.value;
    if (newText.length <= MAX_CHARACTERS) {
      setText(newText);
    }
  };

  return (
    <div className="entry-form">
      <div className="entry-header">
        <h2 className="entry-date">{formatJournalDayDisplay(journalDay)}</h2>
        <p className="entry-context">{getEntryMessage()}</p>
      </div>

      {existingEntry && !isEditing ? (
        <div className="entry-display">
          <p className="entry-text">{existingEntry.text}</p>
          <div className="entry-actions">
            {canEdit ? (
              <button onClick={handleEdit} className="edit-button">
                Edit Entry
              </button>
            ) : (
              <p className="entry-saved-note">Entry saved (past entries cannot be edited)</p>
            )}
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          <textarea
            className="entry-textarea"
            value={text}
            onChange={handleTextChange}
            placeholder="What's the one thing you want to remember from today?"
            disabled={isSubmitting}
            autoFocus
          />
          <div className="entry-footer">
            <span className={`character-count ${charactersRemaining < 50 ? 'warning' : ''}`}>
              {charactersRemaining} characters remaining
            </span>
            <div className="entry-buttons">
              {existingEntry && (
                <button
                  type="button"
                  onClick={handleCancel}
                  className="cancel-button"
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
              )}
              <button
                type="submit"
                className="submit-button"
                disabled={!canSubmit || isSubmitting}
              >
                {isSubmitting ? 'Saving...' : 'Save Entry'}
              </button>
            </div>
          </div>
        </form>
      )}
    </div>
  );
}
