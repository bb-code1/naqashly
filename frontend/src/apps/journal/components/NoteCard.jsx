import React from 'react';

export const NoteCard = ({
  note,
  isSelected,
  handleOpenEditModal,
  checkIsEncryptedNote,
  moodOptions
}) => {
  const moodObj = moodOptions.find(m => m.id === note.mood) || moodOptions[0];

  return (
    <div
      onClick={() => handleOpenEditModal(note)}
      className={`journal-note-card ${isSelected ? 'selected' : ''} ${note.isPinned ? 'pinned' : ''}`}
    >
      <div className="journal-note-card-header">
        <span className="journal-note-card-tag">
          #{note.category || 'WORK'}
        </span>
        <div style={{ display: 'flex', gap: '0.3rem', alignItems: 'center' }}>
          {note.isPinned && <span style={{ fontSize: '0.72rem' }}>📌</span>}
          {checkIsEncryptedNote(note) && <span style={{ fontSize: '0.72rem' }}>🔒</span>}
          <span style={{ fontSize: '0.72rem' }}>{moodObj?.emoji}</span>
        </div>
      </div>
      <h4 className="journal-note-card-title">
        {note.title}
      </h4>
    </div>
  );
};
