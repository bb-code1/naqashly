import React, { useState } from 'react';
import { Button } from '../../../components/ui/Button';
import { CITY_PRESETS } from '../../../utils/solarCalculator';

/**
 * ⚙️ Routine Preferences & Time Block Manager Modal
 * 
 * Allows users to configure:
 * 1. Engine Operating Mode (☀️ Solar Mode vs ⏰ Clock Mode)
 * 2. Location & Astronomical Calculation Method
 * 3. Time Block Management (Add, Edit, Delete custom time blocks)
 * 
 * @author Barkat Bashir
 * @version 1.0.0
 */
export const RoutinePreferencesModal = ({
  isOpen,
  onClose,
  routineMode,
  selectedCityName,
  timeBlocks,
  onUpdateMode,
  onUpdateCity,
  onAddTimeBlock,
  onUpdateTimeBlock,
  onDeleteTimeBlock
}) => {
  if (!isOpen) return null;

  const [newLabel, setNewLabel] = useState('');
  const [newStart, setNewStart] = useState('08:00');
  const [newEnd, setNewEnd] = useState('12:00');
  const [editingBlockId, setEditingBlockId] = useState(null);
  const [editLabel, setEditLabel] = useState('');
  const [editStart, setEditStart] = useState('');
  const [editEnd, setEditEnd] = useState('');

  const handleAddBlockSubmit = (e) => {
    e.preventDefault();
    if (!newLabel.trim()) return;
    onAddTimeBlock({
      blockKey: `CUSTOM_${Date.now()}`,
      label: newLabel.trim(),
      startTime: newStart,
      endTime: newEnd,
      isSolarBound: false,
      displayOrder: timeBlocks.length + 1
    });
    setNewLabel('');
    setNewStart('08:00');
    setNewEnd('12:00');
  };

  const handleStartEdit = (b) => {
    setEditingBlockId(b.id);
    setEditLabel(b.label);
    setEditStart(b.startTime || '08:00');
    setEditEnd(b.endTime || '12:00');
  };

  const handleSaveEdit = (id) => {
    onUpdateTimeBlock(id, {
      label: editLabel,
      startTime: editStart,
      endTime: editEnd
    });
    setEditingBlockId(null);
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)', zIndex: 99999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
      <div style={{ background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-subtle)', borderRadius: '16px', padding: '1.5rem', width: '100%', maxWidth: '640px', maxHeight: '85vh', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.75rem' }}>
          <div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: '800', color: 'var(--text-heading)', margin: 0 }}>⚙️ Routine Preferences & Time Blocks</h3>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: '0.2rem 0 0 0' }}>Configure routine engine mode, solar location, and custom time blocks.</p>
          </div>
          <button type="button" onClick={onClose} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', fontSize: '1.3rem', cursor: 'pointer' }}>✕</button>
        </div>

        {/* 1. Engine Operating Mode */}
        <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: '12px', padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
          <h4 style={{ fontSize: '0.88rem', fontWeight: '800', color: 'var(--text-heading)', margin: 0 }}>1. Engine Operating Mode</h4>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            <button
              type="button"
              onClick={() => onUpdateMode('SOLAR')}
              style={{
                background: routineMode === 'SOLAR' ? 'rgba(16, 185, 129, 0.15)' : 'var(--bg-surface-elevated)',
                border: `1px solid ${routineMode === 'SOLAR' ? '#10B981' : 'var(--border-subtle)'}`,
                borderRadius: '8px',
                padding: '0.75rem',
                textAlign: 'left',
                cursor: 'pointer'
              }}
            >
              <div style={{ fontSize: '0.85rem', fontWeight: '800', color: routineMode === 'SOLAR' ? '#10B981' : 'var(--text-heading)' }}>☀️ Solar Mode</div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>Boundaries dynamically adjust to daily astronomical prayer times (*Fajr, Dhuhr, Maghrib*).</div>
            </button>

            <button
              type="button"
              onClick={() => onUpdateMode('CLOCK')}
              style={{
                background: routineMode === 'CLOCK' ? 'rgba(99, 102, 241, 0.15)' : 'var(--bg-surface-elevated)',
                border: `1px solid ${routineMode === 'CLOCK' ? '#6366F1' : 'var(--border-subtle)'}`,
                borderRadius: '8px',
                padding: '0.75rem',
                textAlign: 'left',
                cursor: 'pointer'
              }}
            >
              <div style={{ fontSize: '0.85rem', fontWeight: '800', color: routineMode === 'CLOCK' ? '#6366F1' : 'var(--text-heading)' }}>⏰ Clock Mode</div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>Fixed custom hours based on user-defined time block boundaries.</div>
            </button>
          </div>
        </div>

        {/* 2. Solar Location Settings */}
        {routineMode === 'SOLAR' && (
          <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: '12px', padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
            <h4 style={{ fontSize: '0.88rem', fontWeight: '800', color: 'var(--text-heading)', margin: 0 }}>2. Solar Coordinates & Location</h4>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-muted)', display: 'block', marginBottom: '0.25rem' }}>Selected City</label>
                <select
                  value={selectedCityName}
                  onChange={(e) => onUpdateCity(e.target.value)}
                  style={{ width: '100%', background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-subtle)', borderRadius: '8px', padding: '0.5rem 0.75rem', color: 'var(--text-heading)', fontSize: '0.82rem', outline: 'none' }}
                >
                  {CITY_PRESETS.map(c => (
                    <option key={c.name} value={c.name}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-muted)', display: 'block', marginBottom: '0.25rem' }}>Calculation Method</label>
                <select
                  defaultValue="MWL"
                  style={{ width: '100%', background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-subtle)', borderRadius: '8px', padding: '0.5rem 0.75rem', color: 'var(--text-heading)', fontSize: '0.82rem', outline: 'none' }}
                >
                  <option value="MWL">Muslim World League (MWL)</option>
                  <option value="ISNA">ISNA (North America)</option>
                  <option value="EGYPT">Egyptian General Authority</option>
                  <option value="MAKKAH">Umm al-Qura (Makkah)</option>
                  <option value="KARACHI">Univ. of Islamic Sciences (Karachi)</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* 3. Time Block Manager */}
        <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: '12px', padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h4 style={{ fontSize: '0.88rem', fontWeight: '800', color: 'var(--text-heading)', margin: 0 }}>3. Time Blocks Management</h4>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{timeBlocks.length} Active Blocks</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {timeBlocks.map(b => (
              <div
                key={b.id}
                style={{
                  background: 'var(--bg-surface-elevated)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: '8px',
                  padding: '0.65rem 0.85rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '0.5rem'
                }}
              >
                {editingBlockId === b.id ? (
                  <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center', width: '100%' }}>
                    <input
                      type="text"
                      value={editLabel}
                      onChange={(e) => setEditLabel(e.target.value)}
                      style={{ flex: 1, background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: '6px', padding: '0.35rem 0.5rem', color: 'var(--text-heading)', fontSize: '0.8rem' }}
                    />
                    <input
                      type="time"
                      value={editStart}
                      onChange={(e) => setEditStart(e.target.value)}
                      style={{ width: '80px', background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: '6px', padding: '0.35rem 0.4rem', color: 'var(--text-heading)', fontSize: '0.75rem' }}
                    />
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>to</span>
                    <input
                      type="time"
                      value={editEnd}
                      onChange={(e) => setEditEnd(e.target.value)}
                      style={{ width: '80px', background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: '6px', padding: '0.35rem 0.4rem', color: 'var(--text-heading)', fontSize: '0.75rem' }}
                    />
                    <button type="button" onClick={() => handleSaveEdit(b.id)} style={{ background: '#10B981', border: 'none', color: '#fff', borderRadius: '6px', padding: '0.35rem 0.6rem', fontSize: '0.75rem', fontWeight: '800', cursor: 'pointer' }}>Save</button>
                    <button type="button" onClick={() => setEditingBlockId(null)} style={{ background: 'transparent', border: '1px solid var(--border-subtle)', color: 'var(--text-muted)', borderRadius: '6px', padding: '0.35rem 0.5rem', fontSize: '0.75rem', cursor: 'pointer' }}>Cancel</button>
                  </div>
                ) : (
                  <>
                    <div>
                      <div style={{ fontSize: '0.85rem', fontWeight: '800', color: 'var(--text-heading)' }}>{b.label}</div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.1rem' }}>
                        {routineMode === 'SOLAR' && b.isSolarBound ? (
                          <span style={{ color: '#10B981', fontWeight: '700' }}>☀️ Bound to Astronomical Solstices ({b.solarStartEvent} ➔ {b.solarEndEvent})</span>
                        ) : (
                          <span>⏰ {b.startTime} – {b.endTime}</span>
                        )}
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '0.35rem' }}>
                      <button
                        type="button"
                        onClick={() => handleStartEdit(b)}
                        style={{ background: 'rgba(99, 102, 241, 0.15)', border: '1px solid #6366F1', color: '#6366F1', borderRadius: '6px', padding: '0.25rem 0.55rem', fontSize: '0.72rem', fontWeight: '800', cursor: 'pointer' }}
                      >
                        ✏️ Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          if (window.confirm(`Delete time block "${b.label}"?`)) {
                            onDeleteTimeBlock(b.id);
                          }
                        }}
                        style={{ background: 'rgba(239, 68, 68, 0.15)', border: '1px solid #EF4444', color: '#EF4444', borderRadius: '6px', padding: '0.25rem 0.55rem', fontSize: '0.72rem', fontWeight: '800', cursor: 'pointer' }}
                      >
                        🗑️
                      </button>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>

          {/* Add New Custom Block Form */}
          <form onSubmit={handleAddBlockSubmit} style={{ marginTop: '0.5rem', borderTop: '1px dashed var(--border-subtle)', paddingTop: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <div style={{ fontSize: '0.78rem', fontWeight: '800', color: 'var(--text-heading)' }}>+ Add New Custom Time Block</div>
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <input
                type="text"
                placeholder="e.g. ☕ Mid-Morning Sprint"
                value={newLabel}
                onChange={(e) => setNewLabel(e.target.value)}
                style={{ flex: 1, background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-subtle)', borderRadius: '6px', padding: '0.45rem 0.65rem', color: 'var(--text-heading)', fontSize: '0.8rem', outline: 'none' }}
                required
              />
              <input
                type="time"
                value={newStart}
                onChange={(e) => setNewStart(e.target.value)}
                style={{ width: '85px', background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-subtle)', borderRadius: '6px', padding: '0.45rem 0.4rem', color: 'var(--text-heading)', fontSize: '0.75rem', outline: 'none' }}
              />
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>to</span>
              <input
                type="time"
                value={newEnd}
                onChange={(e) => setNewEnd(e.target.value)}
                style={{ width: '85px', background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-subtle)', borderRadius: '6px', padding: '0.45rem 0.4rem', color: 'var(--text-heading)', fontSize: '0.75rem', outline: 'none' }}
              />
              <Button type="submit" variant="emerald" style={{ padding: '0.45rem 0.85rem', fontSize: '0.78rem' }}>Add Block</Button>
            </div>
          </form>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', borderTop: '1px solid var(--border-subtle)', paddingTop: '0.75rem' }}>
          <Button type="button" variant="emerald" onClick={onClose}>Done</Button>
        </div>

      </div>
    </div>
  );
};
