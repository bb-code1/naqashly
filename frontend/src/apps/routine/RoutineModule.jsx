import React, { useState } from 'react';
import { CONTEXTUAL_WINDOWS, HABIT_CATEGORIES, CATALOG_PRESETS } from '../../constants/routineConstants';
import { useRoutine } from '../../hooks/useRoutine';
import { useProductivity } from '../../hooks/useProductivity';
import * as productivityApi from '../../api/productivityApi';
import { VisualRoutineTimeline } from './components/VisualRoutineTimeline';
import { SolarArcTimeline } from './components/SolarArcTimeline';
import { HabitQualityPopover } from './components/HabitQualityPopover';
import { CITY_PRESETS } from '../../utils/solarCalculator';
import { Button } from '../../components/ui/Button';
import './RoutineModule.css';

/**
 * 🌿 Routine & Habit Engine Master Executive Suite
 * 
 * Implements 3 Contextual Windows (Morning, Afternoon, Evening),
 * 3-State Tap Toggling (0% -> 50% -> 100%), 30-Day Rolling Consistency HUD,
 * Atmospheric Solar Arc Horizon, Dual Engine Switcher (Solar vs Clock),
 * 3-Pill Quality Selector Popover (Jama'at vs On Time vs Late), and Ecosystem Synergy.
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
    setHabitQualityGrade,
    useFreezePass,
    applyPresetPack,
    handleCreateHabit,
    handleDeleteHabit
  } = useRoutine();

  const { goals, handleUpdateGoalProgress } = useProductivity();

  const selectedCity = CITY_PRESETS.find(c => c.name === selectedCityName) || CITY_PRESETS[0];

  // Auto-detect current active time window for Zen default tab landing
  const currentHour = new Date().getHours();
  const defaultTab = currentHour >= 6 && currentHour < 12 ? 'MORNING' : currentHour >= 12 && currentHour < 18 ? 'AFTERNOON' : 'EVENING';
  const [activeWindowTab, setActiveWindowTab] = useState(defaultTab);
  const [showSolarDrawer, setShowSolarDrawer] = useState(false);
  const [popoverHabitId, setPopoverHabitId] = useState(null);

  const [showAddModal, setShowAddModal] = useState(false);
  const [showPresetModal, setShowPresetModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState('PRODUCTIVITY');
  const [newWindow, setNewWindow] = useState('MORNING');
  const [newTargetMins, setNewTargetMins] = useState(15);
  const [selectedGoalId, setSelectedGoalId] = useState('');

  // Smart Tap Handler: Only Prayer habits open quality popover; non-prayer habits cycle 3-state partial credit directly
  const handleHabitTap = (habit) => {
    const isPrayerHabit = habit.isPrayer || habit.title?.toLowerCase().includes('prayer') || habit.title?.toLowerCase().includes('tahajjud') || habit.title?.toLowerCase().includes('fajr') || habit.title?.toLowerCase().includes('dhuhr') || habit.title?.toLowerCase().includes('asr') || habit.title?.toLowerCase().includes('maghrib') || habit.title?.toLowerCase().includes('isha');

    if (isPrayerHabit) {
      if (habit.status === 'PENDING' || !habit.status) {
        setPopoverHabitId(popoverHabitId === habit.id ? null : habit.id);
      } else {
        cycleHabitStatus(habit.id);
      }
    } else {
      // Standard non-prayer habits cycle 0% -> 50% -> 100% -> 0% directly
      cycleHabitStatus(habit.id);
    }
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

  // Filter habits based on Zen active tab
  const displayedHabits = activeWindowTab === 'ALL' ? habits : habits.filter(h => h.window === activeWindowTab);

  return (
    <div className="routine-suite-container">
      {/* 1. ZEN SINGLE-ROW EXECUTIVE CONTROL HEADER */}
      <div className="routine-header-banner">
        <div className="routine-title-group">
          <h2>🌿 Routine & Habit Engine</h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginTop: '0.2rem' }}>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>📍 {selectedCity.name}</span>
            <span style={{ fontSize: '0.72rem', fontWeight: '800', background: routineMode === 'SOLAR' ? 'rgba(245, 158, 11, 0.15)' : 'rgba(99, 102, 241, 0.15)', color: routineMode === 'SOLAR' ? '#F59E0B' : '#6366F1', border: `1px solid ${routineMode === 'SOLAR' ? 'rgba(245, 158, 11, 0.3)' : 'rgba(99, 102, 241, 0.3)'}`, padding: '0.1rem 0.45rem', borderRadius: '4px' }}>
              {routineMode === 'SOLAR' ? '☀️ Solar Mode' : '⏰ Clock Mode'}
            </span>
          </div>
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
                padding: '0.35rem 0.75rem',
                fontSize: '0.75rem',
                fontWeight: '800',
                cursor: 'pointer',
                transition: 'all 0.3s ease'
              }}
            >
              ☀️ Solar
            </button>
            <button
              type="button"
              onClick={() => updateRoutineMode('CLOCK')}
              style={{
                background: routineMode === 'CLOCK' ? '#6366F1' : 'transparent',
                color: routineMode === 'CLOCK' ? '#FFF' : 'var(--text-muted)',
                border: 'none',
                borderRadius: '8px',
                padding: '0.35rem 0.75rem',
                fontSize: '0.75rem',
                fontWeight: '800',
                cursor: 'pointer',
                transition: 'all 0.3s ease'
              }}
            >
              ⏰ Clock
            </button>
          </div>

          <div style={{ fontSize: '0.85rem', fontWeight: '900', color: 'var(--text-heading)', background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', padding: '0.4rem 0.75rem', borderRadius: '8px' }}>
            🔥 {consistencyScore}% Momentum
          </div>

          <div style={{ fontSize: '0.85rem', fontWeight: '900', color: '#F59E0B', background: 'rgba(245, 158, 11, 0.1)', border: '1px solid rgba(245, 158, 11, 0.3)', padding: '0.4rem 0.75rem', borderRadius: '8px' }}>
            🛡️ {freezePasses} Passes
          </div>

          <Button variant="subtle" onClick={() => setShowPresetModal(true)}>
            ⚡ Presets
          </Button>

          <Button variant="emerald" onClick={() => setShowAddModal(true)}>
            + Add Habit
          </Button>
        </div>
      </div>

      {/* 2. SLIM TIMELINE DISPLAY */}
      {routineMode === 'SOLAR' ? (
        <SolarArcTimeline selectedCity={selectedCity} onCityChange={(c) => updateSelectedCity(c.name)} isExpanded={showSolarDrawer} onToggleExpand={() => setShowSolarDrawer(!showSolarDrawer)} />
      ) : (
        <VisualRoutineTimeline habits={habits} />
      )}

      {/* 3. ZEN CONTEXTUAL FOCUS TABS */}
      <div style={{ display: 'flex', gap: '0.5rem', background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-subtle)', padding: '0.4rem', borderRadius: '12px', overflowX: 'auto' }}>
        {[
          { id: 'MORNING', label: '🌅 Morning Block', subtitle: '06:00 - 12:00' },
          { id: 'AFTERNOON', label: '☀️ Afternoon Block', subtitle: '12:00 - 18:00' },
          { id: 'EVENING', label: '🌙 Evening Block', subtitle: '18:00 - 24:00' },
          { id: 'ALL', label: '🌐 All Habits View', subtitle: 'Full List' }
        ].map(tab => {
          const isActive = activeWindowTab === tab.id;
          const count = tab.id === 'ALL' ? habits.length : habits.filter(h => h.window === tab.id).length;
          const done = tab.id === 'ALL' ? completedHabitsCount : habits.filter(h => h.window === tab.id && h.status === 'COMPLETED').length;

          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveWindowTab(tab.id)}
              style={{
                flex: 1,
                minWidth: '140px',
                background: isActive ? 'var(--bg-surface)' : 'transparent',
                border: `1px solid ${isActive ? 'var(--border-subtle)' : 'transparent'}`,
                boxShadow: isActive ? '0 2px 8px rgba(0, 0, 0, 0.2)' : 'none',
                color: isActive ? 'var(--text-heading)' : 'var(--text-muted)',
                borderRadius: '8px',
                padding: '0.6rem 0.85rem',
                fontSize: '0.82rem',
                fontWeight: '800',
                cursor: 'pointer',
                display: 'flex',
                justify: 'space-between',
                alignItems: 'center',
                transition: 'all 0.25s ease'
              }}
            >
              <span>{tab.label}</span>
              <span style={{ fontSize: '0.72rem', color: isActive ? '#10B981' : 'var(--text-muted)', fontWeight: '900' }}>
                {done}/{count}
              </span>
            </button>
          );
        })}
      </div>

      {/* 4. ZEN FOCUSED HABITS LIST */}
      <div style={{ background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-subtle)', borderRadius: '14px', padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
        {displayedHabits.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2rem 1rem', color: 'var(--text-muted)', fontSize: '0.88rem' }}>
            No habits scheduled for this block. Click <strong>"+ Add Habit"</strong> or <strong>"⚡ Presets"</strong> to add habits!
          </div>
        ) : (
          displayedHabits.map(habit => {
            const catObj = HABIT_CATEGORIES.find(c => c.id === habit.category) || HABIT_CATEGORIES[0];

            return (
              <div key={habit.id} className="habit-item-row">
                <div className="habit-main-info">
                  {/* 3-State Tap Button */}
                  <button
                    type="button"
                    onClick={() => handleHabitTap(habit)}
                    className={`tap-status-btn ${(habit.status || 'PENDING').toLowerCase()}`}
                    title="Click to select prayer quality: Jama'at, On Time, or Late"
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

                      {habit.qualityGrade === 'JAMAAT' && (
                        <span style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#10B981', border: '1px solid #10B981', fontSize: '0.7rem', fontWeight: '800', padding: '0.1rem 0.4rem', borderRadius: '4px' }}>
                          🕌 Jama'at (100%)
                        </span>
                      )}

                      {habit.qualityGrade === 'ON_TIME' && (
                        <span style={{ background: 'rgba(99, 102, 241, 0.15)', color: '#6366F1', border: '1px solid #6366F1', fontSize: '0.7rem', fontWeight: '800', padding: '0.1rem 0.4rem', borderRadius: '4px' }}>
                          ⏰ On Time (85%)
                        </span>
                      )}

                      {habit.qualityGrade === 'LATE' && (
                        <span style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#F59E0B', border: '1px solid #F59E0B', fontSize: '0.7rem', fontWeight: '800', padding: '0.1rem 0.4rem', borderRadius: '4px' }}>
                          ⏳ Late (50%)
                        </span>
                      )}

                      {habit.status === 'PARTIAL' && !habit.qualityGrade && (
                        <span style={{ color: '#F59E0B', fontWeight: '800' }}>⚡ 50% Credit</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Streak Badge, Quality Selector Popover Trigger & Freeze Pass */}
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <button
                    type="button"
                    onClick={() => setPopoverHabitId(popoverHabitId === habit.id ? null : habit.id)}
                    title="Deep Muhasabah Quality Selector: Jama'at, On Time, Late"
                    style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', color: 'var(--text-muted)', borderRadius: '6px', padding: '0.2rem 0.45rem', fontSize: '0.72rem', fontWeight: '800', cursor: 'pointer' }}
                  >
                    •••
                  </button>

                  {popoverHabitId === habit.id && (
                    <HabitQualityPopover
                      habit={habit}
                      onSelectGrade={setHabitQualityGrade}
                      onDeleteHabit={handleDeleteHabit}
                      onClose={() => setPopoverHabitId(null)}
                    />
                  )}
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
