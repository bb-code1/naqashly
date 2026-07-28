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
      className="zen-card"
      onClick={() => handleOpenEditModal(note)}
      style={{
        background: isSelected ? 'rgba(16, 185, 129, 0.08)' : (note.isPinned ? 'rgba(56, 189, 248, 0.04)' : 'var(--bg-surface)'),
        border: `1px solid ${isSelected ? '#10B981' : (note.isPinned ? '#38BDF8' : 'var(--border-subtle)')}`,
        borderRadius: '14px',
        padding: '0.85rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.4rem',
        boxShadow: isSelected ? '0 4px 12px rgba(16, 185, 129, 0.1)' : 'none',
        transition: 'all 0.2s ease'
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: '0.68rem', fontWeight: '800', color: isSelected ? '#10B981' : 'var(--text-muted)' }}>
          #{note.category || 'WORK'}
        </span>
        <div style={{ display: 'flex', gap: '0.3rem', alignItems: 'center' }}>
          {note.isPinned && <span style={{ fontSize: '0.72rem' }}>📌</span>}
          {checkIsEncryptedNote(note) && <span style={{ fontSize: '0.72rem' }}>🔒</span>}
          <span style={{ fontSize: '0.72rem' }}>{moodObj?.emoji}</span>
        </div>
      </div>
      <h4 style={{ fontSize: '0.85rem', fontWeight: '900', color: isSelected ? '#10B981' : 'var(--text-heading)', margin: 0 }}>
        {note.title}
      </h4>
    </div>
  );
};
