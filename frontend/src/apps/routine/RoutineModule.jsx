import React, { useState } from 'react';
import { CONTEXTUAL_WINDOWS, HABIT_CATEGORIES, CATALOG_PRESETS } from '../../constants/routineConstants';
import { useRoutine } from '../../hooks/useRoutine';
import { useProductivity } from '../../hooks/useProductivity';
import * as productivityApi from '../../api/productivityApi';
import { VisualRoutineTimeline } from './components/VisualRoutineTimeline';
import { SolarArcTimeline } from './components/SolarArcTimeline';
import { CITY_PRESETS } from '../../utils/solarCalculator';
import { Button } from '../../components/ui/Button';
import './RoutineModule.css';

/**
 * 🌿 Routine & Habit Engine Master Executive Suite
 * 
 * Implements 3 Contextual Windows (Morning, Afternoon, Evening),
 * 3-State Tap Toggling (0% -> 50% -> 100%), 30-Day Rolling Consistency HUD,
 * Atmospheric Solar Arc Horizon, Dual Engine Switcher (Solar vs Clock), and Ecosystem Synergy.
 * 
 * @author Barkat Bashir
 * @version 1.0.0
 */
export const RoutineModule = () => {
  const {
    habits,
    freezePasses,
    routineMode,
    selectedCityName,
    updateRoutineMode,
    updateSelectedCity,
    consistencyScore,
    completedHabitsCount,
    cycleHabitStatus,
    useFreezePass,
    applyPresetPack,
    handleCreateHabit
  } = useRoutine();

  const { goals, handleUpdateGoalProgress } = useProductivity();

  const selectedCity = CITY_PRESETS.find(c => c.name === selectedCityName) || CITY_PRESETS[0];
  const [showAddModal, setShowAddModal] = useState(false);
  const [showPresetModal, setShowPresetModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState('PRODUCTIVITY');
  const [newWindow, setNewWindow] = useState('MORNING');
  const [newTargetMins, setNewTargetMins] = useState(15);
  const [selectedGoalId, setSelectedGoalId] = useState('');

  // Ecosystem Synergy 3-State Tap Handler
  const handleHabitTap = (habitId) => {
    cycleHabitStatus(habitId, async (completedHabit) => {
      // 1. Ecosystem Synergy: Auto-Advance Linked Goal Target Slider in PostgreSQL
      const targetGoal = goals.find(g => String(g.id) === String(completedHabit.linkedGoalId)) || goals[0];
      if (targetGoal) {
        const nextProgress = Math.min(100, (targetGoal.progressPercentage || 0) + 15);
        await handleUpdateGoalProgress(targetGoal.id, nextProgress);
      }

      // 2. Ecosystem Synergy: Auto-Reserve Time-Block on Native Time-Blocker Calendar
      const slotTime = completedHabit.window === 'MORNING' ? '08:00 AM' : completedHabit.window === 'AFTERNOON' ? '02:00 PM' : '08:00 PM';
      productivityApi.saveTimeBlock({
        title: `🌿 ${completedHabit.title}`,
        slotTime: slotTime,
        blockDate: new Date().toISOString().split('T')[0],
        dayIndex: (new Date().getDay() + 6) % 7,
        priority: 'HIGH',
        status: 'COMPLETED'
      }).catch(err => console.error('[RoutineModule] Auto time-block save failed:', err));
    });
  };

  const onFormSubmit = (e) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    handleCreateHabit({
      title: newTitle,
      category: newCategory,
      window: newWindow,
      targetMinutes: newTargetMins,
      linkedGoalId: selectedGoalId
    });
    setNewTitle('');
    setSelectedGoalId('');
    setShowAddModal(false);
  };

  return (
    <div className="routine-suite-container">
      {/* 1. EXECUTIVE HEADER BANNER */}
      <div className="routine-header-banner">
        <div className="routine-title-group">
          <h2>🌿 Routine & Habit Engine</h2>
          <p>Contextual habits with 3-state partial credit & dynamic solar boundaries.</p>
        </div>

        <div className="routine-hud-metrics">
          {/* Dual Mode Switcher Pill */}
          <div style={{ display: 'flex', background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: '10px', padding: '0.2rem' }}>
            <button
              type="button"
              onClick={() => updateRoutineMode('SOLAR')}
              style={{
                background: routineMode === 'SOLAR' ? '#F59E0B' : 'transparent',
                color: routineMode === 'SOLAR' ? '#000' : 'var(--text-muted)',
                border: 'none',
                borderRadius: '8px',
                padding: '0.45rem 0.85rem',
                fontSize: '0.78rem',
                fontWeight: '800',
                cursor: 'pointer',
                transition: 'all 0.3s ease'
              }}
            >
              ☀️ Solar Mode
            </button>
            <button
              type="button"
              onClick={() => updateRoutineMode('CLOCK')}
              style={{
                background: routineMode === 'CLOCK' ? '#6366F1' : 'transparent',
                color: routineMode === 'CLOCK' ? '#FFF' : 'var(--text-muted)',
                border: 'none',
                borderRadius: '8px',
                padding: '0.45rem 0.85rem',
                fontSize: '0.78rem',
                fontWeight: '800',
                cursor: 'pointer',
                transition: 'all 0.3s ease'
              }}
            >
              ⏰ Clock Mode
            </button>
          </div>

          <div className="hud-ring-card">
            <div className="hud-score-value">{consistencyScore}%</div>
            <div>
              <div className="hud-score-label">30-Day Momentum</div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                {completedHabitsCount} / {habits.length} Habits Logged
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(245, 158, 11, 0.08)', border: '1px solid rgba(245, 158, 11, 0.25)', padding: '0.6rem 1rem', borderRadius: '10px' }}>
            <span style={{ fontSize: '1.2rem' }}>🛡️</span>
            <div>
              <div style={{ fontSize: '0.85rem', fontWeight: '800', color: '#F59E0B' }}>{freezePasses} Freeze Passes</div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Streak Protected</div>
            </div>
          </div>

          <Button variant="subtle" onClick={() => setShowPresetModal(true)}>
            ⚡ Preset Packs
          </Button>

          <Button variant="emerald" onClick={() => setShowAddModal(true)}>
            + Add Habit
          </Button>
        </div>
      </div>

      {/* 2. DYNAMIC TIMELINE DISPLAY (SOLAR vs CLOCK) */}
      {routineMode === 'SOLAR' ? (
        <SolarArcTimeline selectedCity={selectedCity} onCityChange={(c) => updateSelectedCity(c.name)} />
      ) : (
        <VisualRoutineTimeline habits={habits} />
      )}

      {/* 3. CONTEXTUAL TIME WINDOWS GRID */}
      <div className="routine-windows-grid">
        {CONTEXTUAL_WINDOWS.map(win => {
          const windowHabits = habits.filter(h => h.window === win.id);

          return (
            <div key={win.id} className="contextual-window-card" style={{ borderColor: win.border }}>
              <div className="window-card-header">
                <div className="window-title-box">
                  <span className="window-title" style={{ color: win.color }}>{win.label}</span>
                  <span className="window-subtitle">({win.subtitle})</span>
                </div>
                <span style={{ fontSize: '0.78rem', fontWeight: '800', color: 'var(--text-muted)' }}>
                  {windowHabits.filter(h => h.status === 'COMPLETED').length} / {windowHabits.length} Done
                </span>
              </div>

              <div className="habits-list">
                {windowHabits.length === 0 ? (
                  <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontStyle: 'italic', padding: '0.5rem 0' }}>
                    No habits scheduled for this window yet. Click "+ Add Habit" to add one!
                  </div>
                ) : (
                  windowHabits.map(habit => {
                    const catObj = HABIT_CATEGORIES.find(c => c.id === habit.category) || HABIT_CATEGORIES[0];

                    return (
                      <div key={habit.id} className="habit-item-row">
                        <div className="habit-main-info">
                          {/* 3-State Tap Button */}
                          <button
                            type="button"
                            onClick={() => handleHabitTap(habit.id)}
                            className={`tap-status-btn ${(habit.status || 'PENDING').toLowerCase()}`}
                            title="Click to toggle: Pending ➔ 50% Half-Credit ➔ 100% Complete"
                          >
                            {habit.status === 'COMPLETED' ? '✓' : habit.status === 'PARTIAL' ? '🌓' : '⭕'}
                          </button>

                          <div className="habit-text-box">
                            <h4 className={habit.status === 'COMPLETED' ? 'completed' : ''}>
                              {habit.title}
                            </h4>

                            <div className="habit-meta-badges">
                              <span className="category-tag" style={{ background: `${catObj.color}15`, color: catObj.color, border: `1px solid ${catObj.color}40` }}>
                                {catObj.label}
                              </span>

                              <span style={{ color: 'var(--text-muted)' }}>⏱️ {habit.targetMinutes}m</span>

                              {habit.status === 'PARTIAL' && (
                                <span style={{ color: '#F59E0B', fontWeight: '800' }}>⚡ 50% Credit</span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Streak Badge & Freeze Pass Action */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          {habit.isFreezeProtected ? (
                            <span style={{ fontSize: '0.75rem', fontWeight: '800', color: '#10B981', background: 'rgba(16, 185, 129, 0.15)', padding: '0.2rem 0.5rem', borderRadius: '6px', border: '1px solid #10B981' }}>
                              🛡️ Protected
                            </span>
                          ) : (
                            habit.status === 'PENDING' && (
                              <button
                                type="button"
                                onClick={() => useFreezePass(habit.id)}
                                title="Use 1 Freeze Pass to protect this streak"
                                style={{ background: 'rgba(245, 158, 11, 0.1)', border: '1px solid rgba(245, 158, 11, 0.3)', color: '#F59E0B', borderRadius: '6px', padding: '0.2rem 0.5rem', fontSize: '0.72rem', fontWeight: '800', cursor: 'pointer' }}
                              >
                                🛡️ Freeze
                              </button>
                            )
                          )}

                          <div className="streak-badge">
                            🔥 {habit.streakCount}d
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* 3. ADD HABIT MODAL */}
      {showAddModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
          <div style={{ background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-subtle)', borderRadius: '16px', padding: '1.75rem', width: '100%', maxWidth: '480px', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.75rem' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: '800', color: 'var(--text-heading)' }}>🌿 Add New Custom Habit</h3>
              <button type="button" onClick={() => setShowAddModal(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '1.2rem', cursor: 'pointer' }}>✕</button>
            </div>

            <form onSubmit={onFormSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--text-muted)', display: 'block', marginBottom: '0.35rem' }}>Habit Title</label>
                <input
                  type="text"
                  placeholder="e.g. Read 20 Pages of Technical Architecture"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  style={{ width: '100%', background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: '8px', padding: '0.6rem 0.85rem', color: 'var(--text-heading)', fontSize: '0.88rem', outline: 'none' }}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.75rem' }}>
                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--text-muted)', display: 'block', marginBottom: '0.35rem' }}>Context Window</label>
                  <select
                    value={newWindow}
                    onChange={(e) => setNewWindow(e.target.value)}
                    style={{ width: '100%', background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: '8px', padding: '0.6rem 0.85rem', color: 'var(--text-heading)', fontSize: '0.85rem', outline: 'none' }}
                  >
                    {CONTEXTUAL_WINDOWS.map(w => (
                      <option key={w.id} value={w.id}>{w.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--text-muted)', display: 'block', marginBottom: '0.35rem' }}>Category</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    style={{ width: '100%', background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: '8px', padding: '0.6rem 0.85rem', color: 'var(--text-heading)', fontSize: '0.85rem', outline: 'none' }}
                  >
                    {HABIT_CATEGORIES.map(c => (
                      <option key={c.id} value={c.id}>{c.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--text-muted)', display: 'block', marginBottom: '0.35rem' }}>Target Duration (Minutes)</label>
                <input
                  type="number"
                  min="1"
                  max="300"
                  value={newTargetMins}
                  onChange={(e) => setNewTargetMins(e.target.value)}
                  style={{ width: '100%', background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: '8px', padding: '0.6rem 0.85rem', color: 'var(--text-heading)', fontSize: '0.88rem', outline: 'none' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--text-muted)', display: 'block', marginBottom: '0.35rem' }}>🎯 Link Parent Goal Target (Optional Ecosystem Synergy)</label>
                <select
                  value={selectedGoalId}
                  onChange={(e) => setSelectedGoalId(e.target.value)}
                  style={{ width: '100%', background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: '8px', padding: '0.6rem 0.85rem', color: 'var(--text-heading)', fontSize: '0.85rem', outline: 'none' }}
                >
                  <option value="">-- No Linked Goal --</option>
                  {goals.map(g => (
                    <option key={g.id} value={g.id}>{g.title} ({g.progressPercentage}%)</option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
                <Button type="button" variant="subtle" onClick={() => setShowAddModal(false)}>Cancel</Button>
                <Button type="submit" variant="emerald">+ Save Habit</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 5. 1-CLICK CATALOG PRESET PACKS MODAL */}
      {showPresetModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0, 0, 0, 0.75)', backdropFilter: 'blur(8px)', zIndex: 99999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          <div style={{ background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-subtle)', borderRadius: '16px', padding: '1.5rem', width: '100%', maxWidth: '650px', maxHeight: '85vh', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: '800', color: 'var(--text-heading)', margin: 0 }}>⚡ 1-Click Starter Preset Packs</h3>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: '0.2rem 0 0 0' }}>Seed curated routine blueprints directly into PostgreSQL (`routine-service`).</p>
              </div>
              <button
                type="button"
                onClick={() => setShowPresetModal(false)}
                style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', fontSize: '1.3rem', cursor: 'pointer' }}
              >
                ✕
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              {CATALOG_PRESETS.map(preset => (
                <div
                  key={preset.id}
                  style={{
                    background: 'var(--bg-surface)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: '12px',
                    padding: '1rem 1.15rem',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.5rem'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h4 style={{ fontSize: '0.95rem', fontWeight: '800', color: 'var(--text-heading)', margin: 0 }}>
                      {preset.title}
                    </h4>
                    <span style={{ fontSize: '0.72rem', fontWeight: '800', background: 'rgba(99, 102, 241, 0.15)', color: '#6366F1', border: '1px solid rgba(99, 102, 241, 0.3)', padding: '0.15rem 0.5rem', borderRadius: '6px' }}>
                      {preset.badge}
                    </span>
                  </div>

                  <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: 0, lineHeight: 1.4 }}>
                    {preset.description}
                  </p>

                  <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.35rem' }}>
                    <Button
                      variant={preset.id === 'ISLAMIC' ? 'emerald' : 'subtle'}
                      onClick={() => {
                        applyPresetPack(preset.id);
                        setShowPresetModal(false);
                      }}
                    >
                      ⚡ Apply {preset.id === 'CUSTOM' ? 'Empty Slate' : 'Pack'}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
