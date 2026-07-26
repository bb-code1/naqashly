import React, { useState } from 'react';
import { Button } from '../../../components/ui/Button';
import { ConfirmModal } from '../../../components/ui/ConfirmModal';
import { CITY_PRESETS, getCurrentGPSLocation, reverseGeocodeLocation, searchGlobalCityLocation } from '../../../utils/solarCalculator';
import { CATALOG_PRESETS } from '../../../constants/routineConstants';

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
  selectedCity,
  timeBlocks,
  isIslamicPreset,
  notificationsEnabled,
  audioEnabled,
  onToggleNotifications,
  onToggleAudio,
  onUpdateMode,
  onUpdateCity,
  onApplyPreset,
  onAddTimeBlock,
  onUpdateTimeBlock,
  onDeleteTimeBlock,
  habits = []
}) => {
  if (!isOpen) return null;

  const [selectedPreset, setSelectedPreset] = useState('MINDFULNESS');
  const [presetToConfirm, setPresetToConfirm] = useState(null);
  const [blockToDelete, setBlockToDelete] = useState(null);
  const [isLocating, setIsLocating] = useState(false);
  const [customCityInput, setCustomCityInput] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  const handleSearchCitySubmit = async (e) => {
    e?.preventDefault();
    if (!customCityInput.trim()) return;
    setIsSearching(true);
    try {
      const results = await searchGlobalCityLocation(customCityInput);
      setSearchResults(results);
      if (results.length === 1) {
        onUpdateCity({ name: results[0].name, lat: results[0].lat, lng: results[0].lng });
        setSearchResults([]);
        setCustomCityInput('');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSearching(false);
    }
  };
  const [newLabel, setNewLabel] = useState('');
  const [newStart, setNewStart] = useState('08:00');
  const [newEnd, setNewEnd] = useState('12:00');
  const [editingBlockId, setEditingBlockId] = useState(null);
  const [editLabel, setEditLabel] = useState('');
  const [editStart, setEditStart] = useState('');
  const [editEnd, setEditEnd] = useState('');

  const isSelectedCityInPresets = CITY_PRESETS.some(c => c.name === selectedCityName);

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
            <h3 style={{ fontSize: '1.15rem', fontWeight: '800', color: 'var(--text-heading)', margin: 0 }}>⚙️ Routine Preferences</h3>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: '0.2rem 0 0 0' }}>Configure your lifestyle blueprint, notifications, and manage daily time block boundaries.</p>
          </div>
          <button type="button" onClick={onClose} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', fontSize: '1.3rem', cursor: 'pointer' }}>✕</button>
        </div>

        {/* 0. Smart Notifications & Audio Controls */}
        <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: '12px', padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <h4 style={{ fontSize: '0.88rem', fontWeight: '800', color: 'var(--text-heading)', margin: 0 }}>🔔 Smart Notifications & Audio Controls</h4>
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <button
              type="button"
              onClick={onToggleNotifications}
              style={{
                background: notificationsEnabled ? 'rgba(16, 185, 129, 0.15)' : 'var(--bg-surface-elevated)',
                color: notificationsEnabled ? '#10B981' : 'var(--text-heading)',
                border: `1px solid ${notificationsEnabled ? '#10B981' : 'var(--border-subtle)'}`,
                padding: '0.5rem 0.85rem',
                borderRadius: '8px',
                fontSize: '0.8rem',
                fontWeight: '800',
                cursor: 'pointer'
              }}
            >
              {notificationsEnabled ? '🔔 10m Solar Notifications: ON' : '🔕 Web Notifications: OFF'}
            </button>

            <button
              type="button"
              onClick={onToggleAudio}
              style={{
                background: audioEnabled ? 'rgba(99, 102, 241, 0.15)' : 'var(--bg-surface-elevated)',
                color: audioEnabled ? '#6366F1' : 'var(--text-heading)',
                border: `1px solid ${audioEnabled ? '#6366F1' : 'var(--border-subtle)'}`,
                padding: '0.5rem 0.85rem',
                borderRadius: '8px',
                fontSize: '0.8rem',
                fontWeight: '800',
                cursor: 'pointer'
              }}
            >
              {audioEnabled ? '🔊 Solstice Ambient Chime: ON' : '🔇 Audio Chime: OFF'}
            </button>
          </div>
        </div>

        {/* 1. Choose Lifestyle Blueprint (Preset) */}
        {onApplyPreset && (
          <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: '12px', padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h4 style={{ fontSize: '0.88rem', fontWeight: '800', color: 'var(--text-heading)', margin: 0 }}>⚡ 1. Lifestyle Presets</h4>
              <span style={{ fontSize: '0.72rem', color: '#10B981', fontWeight: '800' }}>1-Click Setup</span>
            </div>
            <p style={{ fontSize: '0.76rem', color: 'var(--text-muted)', margin: 0, lineHeight: 1.4 }}>
              Selecting a blueprint auto-configures your habits, routine mode (*Solar vs. Clock*), and time block boundaries automatically.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '0.25rem' }}>
              {CATALOG_PRESETS.map(preset => {
                const isIslamic = preset.id === 'ISLAMIC';
                const isDeepWork = preset.id === 'DEEP_WORK';
                const isMindfulness = preset.id === 'MINDFULNESS';
                const isReligious = preset.badge?.includes('Religious');
                const isSelected = selectedPreset === preset.id;

                return (
                  <div
                    key={preset.id}
                    onClick={() => setSelectedPreset(preset.id)}
                    style={{
                      background: 'var(--bg-surface-elevated)',
                      border: `1px solid ${isSelected ? '#10B981' : 'var(--border-subtle)'}`,
                      borderRadius: '10px',
                      padding: '0.85rem 1rem',
                      cursor: 'pointer',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.6rem',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <h5 style={{ fontSize: '0.9rem', fontWeight: '800', color: 'var(--text-heading)', margin: 0 }}>{preset.title}</h5>
                        <span style={{ fontSize: '0.7rem', fontWeight: '800', background: isIslamic ? 'rgba(16, 185, 129, 0.15)' : 'rgba(99, 102, 241, 0.15)', color: isIslamic ? '#10B981' : '#6366F1', border: `1px solid ${isIslamic ? 'rgba(16, 185, 129, 0.3)' : 'rgba(99, 102, 241, 0.3)'}`, padding: '0.15rem 0.5rem', borderRadius: '6px' }}>
                          {isIslamic ? '☀️ Solar Solstices' : '⏰ Fixed Clock Hours'}
                        </span>
                      </div>
                      <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{preset.habits.length} Habits</span>
                    </div>

                    <p style={{ fontSize: '0.76rem', color: 'var(--text-muted)', margin: 0, lineHeight: 1.35 }}>
                      {preset.description}
                    </p>

                    {/* Preview Breakdown: Time Blocks & Included Habits */}
                    {isSelected && (
                      <div style={{ marginTop: '0.4rem', borderTop: '1px dashed var(--border-subtle)', paddingTop: '0.6rem', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                        <div>
                          <div style={{ fontSize: '0.72rem', fontWeight: '800', color: 'var(--text-muted)', marginBottom: '0.3rem' }}>🧱 TIME BLOCKS PRE-SEEDED:</div>
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                            {isIslamic ? (
                              <>
                                <span style={{ fontSize: '0.72rem', background: 'rgba(16, 185, 129, 0.12)', color: '#10B981', border: '1px solid rgba(16, 185, 129, 0.3)', padding: '0.2rem 0.5rem', borderRadius: '6px', fontWeight: '700' }}>🌅 Morning Block (Fajr ➔ Dhuhr)</span>
                                <span style={{ fontSize: '0.72rem', background: 'rgba(16, 185, 129, 0.12)', color: '#10B981', border: '1px solid rgba(16, 185, 129, 0.3)', padding: '0.2rem 0.5rem', borderRadius: '6px', fontWeight: '700' }}>☀️ Afternoon Block (Dhuhr ➔ Maghrib)</span>
                                <span style={{ fontSize: '0.72rem', background: 'rgba(16, 185, 129, 0.12)', color: '#10B981', border: '1px solid rgba(16, 185, 129, 0.3)', padding: '0.2rem 0.5rem', borderRadius: '6px', fontWeight: '700' }}>🌙 Night Block (Maghrib ➔ Fajr)</span>
                              </>
                            ) : isDeepWork ? (
                              <>
                                <span style={{ fontSize: '0.72rem', background: 'rgba(99, 102, 241, 0.12)', color: '#6366F1', border: '1px solid rgba(99, 102, 241, 0.3)', padding: '0.2rem 0.5rem', borderRadius: '6px', fontWeight: '700' }}>🌅 Deep Work Morning (8 AM - 12 PM)</span>
                                <span style={{ fontSize: '0.72rem', background: 'rgba(99, 102, 241, 0.12)', color: '#6366F1', border: '1px solid rgba(99, 102, 241, 0.3)', padding: '0.2rem 0.5rem', borderRadius: '6px', fontWeight: '700' }}>☀️ Standups & PR Reviews (12 PM - 5 PM)</span>
                                <span style={{ fontSize: '0.72rem', background: 'rgba(99, 102, 241, 0.12)', color: '#6366F1', border: '1px solid rgba(99, 102, 241, 0.3)', padding: '0.2rem 0.5rem', borderRadius: '6px', fontWeight: '700' }}>🌙 Journal & Retro (5 PM - 10 PM)</span>
                              </>
                            ) : (
                              <>
                                <span style={{ fontSize: '0.72rem', background: 'rgba(245, 158, 11, 0.12)', color: '#F59E0B', border: '1px solid rgba(245, 158, 11, 0.3)', padding: '0.2rem 0.5rem', borderRadius: '6px', fontWeight: '700' }}>🌅 Dawn Meditation & Yoga (6-10 AM)</span>
                                <span style={{ fontSize: '0.72rem', background: 'rgba(245, 158, 11, 0.12)', color: '#F59E0B', border: '1px solid rgba(245, 158, 11, 0.3)', padding: '0.2rem 0.5rem', borderRadius: '6px', fontWeight: '700' }}>☀️ Mindful Work & Hydration (10 AM-6 PM)</span>
                                <span style={{ fontSize: '0.72rem', background: 'rgba(245, 158, 11, 0.12)', color: '#F59E0B', border: '1px solid rgba(245, 158, 11, 0.3)', padding: '0.2rem 0.5rem', borderRadius: '6px', fontWeight: '700' }}>🌙 Unplug & Reflection (6-10 PM)</span>
                              </>
                            )}
                          </div>
                        </div>

                        {preset.habits.length > 0 && (
                          <div>
                            <div style={{ fontSize: '0.72rem', fontWeight: '800', color: 'var(--text-muted)', marginBottom: '0.3rem' }}>📋 HABITS SEEDED:</div>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
                              {preset.habits.map((h, i) => (
                                <span key={i} style={{ fontSize: '0.7rem', background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', padding: '0.15rem 0.45rem', borderRadius: '4px', color: 'var(--text-heading)' }}>
                                  {h.title}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.25rem' }}>
                          <Button
                            variant="emerald"
                            onClick={(e) => {
                              e.stopPropagation();
                              if (habits && habits.length > 0) {
                                setPresetToConfirm(preset);
                              } else {
                                onApplyPreset(preset.id, 'replace');
                              }
                            }}
                          >
                            ⚡ Apply {preset.title} Blueprint
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* 2. Engine Operating Mode */}
        {isIslamicPreset && (
          <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: '12px', padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
            <h4 style={{ fontSize: '0.88rem', fontWeight: '800', color: 'var(--text-heading)', margin: 0 }}>2. Engine Operating Mode</h4>
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
        )}

        {/* 2. Solar Coordinates & Calculation Method */}
        {(isIslamicPreset || routineMode === 'SOLAR') && (
          <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: '12px', padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h4 style={{ fontSize: '0.88rem', fontWeight: '800', color: 'var(--text-heading)', margin: 0 }}>2. Global Location & Astronomical Method</h4>
              <button
                type="button"
                disabled={isLocating}
                onClick={async () => {
                  setIsLocating(true);
                  try {
                    const loc = await getCurrentGPSLocation();
                    const cityName = await reverseGeocodeLocation(loc.lat, loc.lng);
                    onUpdateCity({ name: cityName, lat: loc.lat, lng: loc.lng });
                  } catch (err) {
                    alert('Could not access GPS location. Please ensure location permissions are allowed in browser.');
                  } finally {
                    setIsLocating(false);
                  }
                }}
                style={{ background: 'rgba(16, 185, 129, 0.15)', border: '1px solid #10B981', color: '#10B981', borderRadius: '6px', padding: '0.25rem 0.65rem', fontSize: '0.72rem', fontWeight: '800', cursor: 'pointer' }}
              >
                {isLocating ? '⌛ Detecting GPS...' : '📍 Auto-Detect GPS'}
              </button>
            </div>

            {/* Custom City Search Input Form */}
            <form onSubmit={handleSearchCitySubmit} style={{ display: 'flex', gap: '0.5rem', position: 'relative' }}>
              <input
                type="text"
                value={customCityInput}
                onChange={(e) => setCustomCityInput(e.target.value)}
                placeholder="🔍 Type any city or country (e.g., Srinagar, Tokyo, Cairo, Paris)..."
                style={{ flex: 1, background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-subtle)', borderRadius: '8px', padding: '0.45rem 0.75rem', color: 'var(--text-heading)', fontSize: '0.82rem', outline: 'none' }}
              />
              <button
                type="submit"
                disabled={isSearching || !customCityInput.trim()}
                style={{ background: 'var(--accent-primary, #6366F1)', color: '#fff', border: 'none', borderRadius: '8px', padding: '0.45rem 0.85rem', fontSize: '0.78rem', fontWeight: '800', cursor: 'pointer', opacity: (!customCityInput.trim() || isSearching) ? 0.6 : 1 }}
              >
                {isSearching ? 'Searching...' : '🔍 Fetch City'}
              </button>

              {/* Suggestions Dropdown */}
              {searchResults.length > 0 && (
                <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 20, background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-subtle)', borderRadius: '8px', marginTop: '4px', boxShadow: '0 8px 24px rgba(0,0,0,0.3)', maxHeight: '180px', overflowY: 'auto' }}>
                  {searchResults.map((r, i) => (
                    <div
                      key={i}
                      onClick={() => {
                        onUpdateCity({ name: r.name, lat: r.lat, lng: r.lng });
                        setSearchResults([]);
                        setCustomCityInput('');
                      }}
                      style={{ padding: '0.5rem 0.75rem', borderBottom: '1px solid var(--border-subtle)', cursor: 'pointer', fontSize: '0.78rem', color: 'var(--text-heading)' }}
                    >
                      📍 <strong>{r.name}</strong> <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>({r.displayName})</span>
                    </div>
                  ))}
                </div>
              )}
            </form>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginTop: '0.25rem' }}>
              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-muted)', display: 'block', marginBottom: '0.25rem' }}>Active Selected Location</label>
                <select
                  value={selectedCityName}
                  onChange={(e) => onUpdateCity(e.target.value)}
                  style={{ width: '100%', background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-subtle)', borderRadius: '8px', padding: '0.5rem 0.75rem', color: 'var(--text-heading)', fontSize: '0.82rem', outline: 'none' }}
                >
                  {!isSelectedCityInPresets && selectedCityName && (
                    <option value={selectedCityName}>📍 {selectedCityName}</option>
                  )}
                  {CITY_PRESETS.map(c => (
                    <option key={c.name} value={c.name}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-muted)', display: 'block', marginBottom: '0.25rem' }}>Calculation Method</label>
                <select
                  value={typeof selectedCity === 'object' ? (selectedCity.method || 'MWL') : 'MWL'}
                  onChange={(e) => {
                    const newMethod = e.target.value;
                    if (typeof selectedCity === 'object') {
                      onUpdateCity({ ...selectedCity, method: newMethod });
                    } else {
                      const preset = CITY_PRESETS.find(c => c.name === selectedCityName) || { name: selectedCityName, lat: 51.5074, lng: -0.1278 };
                      onUpdateCity({ ...preset, method: newMethod });
                    }
                  }}
                  style={{ width: '100%', background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-subtle)', borderRadius: '8px', padding: '0.5rem 0.75rem', color: 'var(--text-heading)', fontSize: '0.82rem', outline: 'none' }}
                >
                  <option value="MWL">Muslim World League (MWL)</option>
                  <option value="Karachi">Univ. of Islamic Sciences (Karachi)</option>
                  <option value="Umm al-Qura">Umm al-Qura (Makkah)</option>
                  <option value="ISNA">ISNA (North America)</option>
                  <option value="Egypt">Egyptian General Authority</option>
                  <option value="Tehran">Geophysics (Tehran)</option>
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
                        onClick={() => setBlockToDelete(b)}
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

      {/* 🚀 THEME-AWARE GLASSMORPHIC CONFIRMATION MODAL */}
      {presetToConfirm && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            background: 'rgba(0, 0, 0, 0.65)',
            backdropFilter: 'blur(12px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 20000,
            padding: '1.5rem',
            boxSizing: 'border-box'
          }}
        >
          <div
            style={{
              background: 'var(--bg-dropdown-surface, #0E131F)',
              border: '1px solid var(--border-subtle)',
              borderRadius: '16px',
              padding: '1.75rem',
              maxWidth: '440px',
              width: '100%',
              boxShadow: '0 20px 50px rgba(0, 0, 0, 0.6)',
              display: 'flex',
              flexDirection: 'column',
              gap: '1.25rem',
              boxSizing: 'border-box'
            }}
          >
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: '900', color: 'var(--text-heading)', margin: 0 }}>
                📦 Apply "{presetToConfirm.title}" Blueprint?
              </h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.6rem', lineHeight: 1.45 }}>
                You already have habits tracked in your routine list. Choose how you would like to apply this preset pack:
              </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <button
                type="button"
                onClick={() => {
                  onApplyPreset(presetToConfirm.id, 'merge');
                  setPresetToConfirm(null);
                }}
                style={{
                  width: '100%',
                  background: 'rgba(16, 185, 129, 0.12)',
                  border: '1px solid #10B981',
                  color: '#10B981',
                  borderRadius: '10px',
                  padding: '0.75rem 1rem',
                  fontSize: '0.85rem',
                  fontWeight: '800',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.2s ease',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.15rem'
                }}
              >
                <span style={{ fontSize: '0.85rem', fontWeight: '900' }}>🚀 Merge Habits (Safe)</span>
                <span style={{ fontSize: '0.7rem', opacity: 0.8, fontWeight: '500', color: 'var(--text-muted)' }}>
                  Appends new preset habits without deleting your current ones or custom tasks.
                </span>
              </button>

              <button
                type="button"
                onClick={() => {
                  onApplyPreset(presetToConfirm.id, 'replace');
                  setPresetToConfirm(null);
                }}
                style={{
                  width: '100%',
                  background: 'rgba(239, 68, 68, 0.12)',
                  border: '1px solid #EF4444',
                  color: '#EF4444',
                  borderRadius: '10px',
                  padding: '0.75rem 1rem',
                  fontSize: '0.85rem',
                  fontWeight: '800',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.2s ease',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.15rem'
                }}
              >
                <span style={{ fontSize: '0.85rem', fontWeight: '900' }}>⚠️ Replace All (Overwrite)</span>
                <span style={{ fontSize: '0.7rem', opacity: 0.8, fontWeight: '500', color: 'var(--text-muted)' }}>
                  Clears all current habits (including custom ones) to start fresh with only this preset.
                </span>
              </button>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', borderTop: '1px solid var(--border-subtle)', paddingTop: '0.75rem', marginTop: '0.25rem' }}>
              <Button type="button" variant="secondary" onClick={() => setPresetToConfirm(null)}>
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* 🧱 TIME BLOCK DELETION GLASSMORPHIC CONFIRMATION MODAL */}
      <ConfirmModal
        isOpen={!!blockToDelete}
        title={`Delete Time Block "${blockToDelete?.label}"?`}
        message="Are you sure you want to delete this custom time block? Associated habits will be reassigned to the default view."
        confirmText="🗑️ Delete Block"
        cancelText="Cancel"
        variant="danger"
        onConfirm={() => {
          if (blockToDelete) {
            onDeleteTimeBlock(blockToDelete.id);
            setBlockToDelete(null);
          }
        }}
        onClose={() => setBlockToDelete(null)}
      />
    </div>
  );
};
