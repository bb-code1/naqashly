import React, { useState } from 'react';
import { CONTEXTUAL_WINDOWS, HABIT_CATEGORIES, CATALOG_PRESETS } from '../../constants/routineConstants';
import { useRoutine } from '../../hooks/useRoutine';
import { useProductivity } from '../../hooks/useProductivity';
import * as productivityApi from '../../api/productivityApi';
import { VisualRoutineTimeline } from './components/VisualRoutineTimeline';
import { SolarArcTimeline } from './components/SolarArcTimeline';
import { HabitQualityPopover } from './components/HabitQualityPopover';
import { RoutinePreferencesModal } from './components/RoutinePreferencesModal';
import { ConfirmModal } from '../../components/ui/ConfirmModal';
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
    selectedCity,
    selectedCityName,
    timeBlocks,
    updateRoutineMode,
    updateSelectedCity,
    consistencyScore,
    completedHabitsCount,
    cycleHabitStatus,
    setHabitQualityGrade,
    useFreezePass,
    applyPresetPack,
    handleCreateHabit,
    handleDeleteHabit,
    handleUpdateHabit,
    handleAddTimeBlock,
    handleUpdateTimeBlock,
    handleDeleteTimeBlock
  } = useRoutine();

  const { goals, handleUpdateGoalProgress } = useProductivity();

  // Derive if Islamic Preset / Prayer routines are present
  const isIslamicPreset = habits.some(h => h.isPrayer || h.title?.toLowerCase().includes('prayer') || h.title?.toLowerCase().includes('fajr') || h.title?.toLowerCase().includes('dhuhr') || h.title?.toLowerCase().includes('asr') || h.title?.toLowerCase().includes('maghrib') || h.title?.toLowerCase().includes('isha'));

  // Auto-detect current active time window for Zen default tab landing
  const currentHour = new Date().getHours();
  const defaultTab = currentHour >= 6 && currentHour < 12 ? 'MORNING' : currentHour >= 12 && currentHour < 18 ? 'AFTERNOON' : 'EVENING';
  const [activeWindowTab, setActiveWindowTab] = useState(defaultTab);
  const [showSolarDrawer, setShowSolarDrawer] = useState(false);
  const [popoverHabitId, setPopoverHabitId] = useState(null);
  const [editingHabit, setEditingHabit] = useState(null);
  const [habitToDelete, setHabitToDelete] = useState(null);
  const [showPrefsModal, setShowPrefsModal] = useState(false);

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
      title: newTitle.trim(),
      category: newCategory,
      window: newWindow,
      targetMinutes: Number(newTargetMins),
      linkedGoalId: selectedGoalId || null
    });
    setNewTitle('');
    setShowAddModal(false);
  };

  // Filter habits based on Zen active tab
  const displayedHabits = activeWindowTab === 'ALL' ? habits : habits.filter(h => h.window === activeWindowTab);

  return (
    <div className="routine-master-container" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      
      {/* 1. EXECUTIVE SINGLE-ROW HEADER CONTROL BAR */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-subtle)', borderRadius: '16px', padding: '0.85rem 1.25rem', boxShadow: '0 4px 20px rgba(0, 0, 0, 0.2)', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div>
          <h2 style={{ fontSize: '1.2rem', fontWeight: '900', color: 'var(--text-heading)', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            🌿 Routine & Habit Engine
          </h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginTop: '0.2rem' }}>
            <button
              type="button"
              onClick={() => setShowPrefsModal(true)}
              title="Click to change location or auto-detect GPS"
              style={{ background: 'transparent', border: 'none', padding: 0, fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.25rem', cursor: 'pointer' }}
            >
              📍 {selectedCity.name} ⚙️
            </button>
            <span style={{ fontSize: '0.68rem', fontWeight: '800', background: routineMode === 'SOLAR' ? 'rgba(245, 158, 11, 0.15)' : 'rgba(99, 102, 241, 0.15)', color: routineMode === 'SOLAR' ? '#F59E0B' : '#6366F1', border: `1px solid ${routineMode === 'SOLAR' ? 'rgba(245, 158, 11, 0.3)' : 'rgba(99, 102, 241, 0.3)'}`, padding: '0.15rem 0.5rem', borderRadius: '6px' }}>
              {routineMode === 'SOLAR' ? '☀️ Solar Solstices' : '⏰ Fixed Clock Hours'}
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          <div style={{ fontSize: '0.85rem', fontWeight: '900', color: 'var(--text-heading)', background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', padding: '0.4rem 0.75rem', borderRadius: '8px' }}>
            🔥 {consistencyScore}% Momentum
          </div>

          <div style={{ fontSize: '0.85rem', fontWeight: '900', color: '#F59E0B', background: 'rgba(245, 158, 11, 0.1)', border: '1px solid rgba(245, 158, 11, 0.3)', padding: '0.4rem 0.75rem', borderRadius: '8px' }}>
            🛡️ {freezePasses} Passes
          </div>

          <Button variant="subtle" onClick={() => setShowPrefsModal(true)} title="Configure Routine Mode & Custom Time Blocks">
            ⚙️ Settings
          </Button>

          <Button variant="emerald" onClick={() => setShowAddModal(true)}>
            + Add Habit
          </Button>
        </div>
      </div>

      {/* 2. TIMELINE DISPLAY (Solar Arc ONLY for Islamic Preset; Visual Timeline for Clock Mode) */}
      {isIslamicPreset && routineMode === 'SOLAR' ? (
        <SolarArcTimeline selectedCity={selectedCity} onCityChange={(c) => updateSelectedCity(c.name)} isExpanded={showSolarDrawer} onToggleExpand={() => setShowSolarDrawer(!showSolarDrawer)} />
      ) : (
        <VisualRoutineTimeline habits={habits} />
      )}

      {/* 3. ZEN CONTEXTUAL FOCUS TABS (Dynamic from User Time Blocks) */}
      <div style={{ display: 'flex', gap: '0.5rem', background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-subtle)', padding: '0.4rem', borderRadius: '12px', overflowX: 'auto' }}>
        {[
          ...timeBlocks.map(b => ({
            id: b.blockKey,
            label: b.label,
            subtitle: routineMode === 'SOLAR' && b.isSolarBound ? `${b.solarStartEvent || ''} ➔ ${b.solarEndEvent || ''}` : `${b.startTime || '06:00'} - ${b.endTime || '12:00'}`
          })),
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
                justifyContent: 'space-between',
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
                      onEditHabit={(h) => setEditingHabit(h)}
                      onDeleteHabit={(id) => {
                        const h = habits.find(x => x.id === id);
                        if (h) setHabitToDelete(h);
                      }}
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

      {/* 4. EDIT HABIT MODAL */}
      {editingHabit && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
          <div style={{ background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-subtle)', borderRadius: '16px', padding: '1.75rem', width: '100%', maxWidth: '480px', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.75rem' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: '800', color: 'var(--text-heading)' }}>✏️ Edit Habit Contract</h3>
              <button type="button" onClick={() => setEditingHabit(null)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '1.2rem', cursor: 'pointer' }}>✕</button>
            </div>

            <form onSubmit={(e) => {
              e.preventDefault();
              handleUpdateHabit(editingHabit.id, {
                title: editingHabit.title,
                category: editingHabit.category,
                window: editingHabit.window,
                targetMinutes: Number(editingHabit.targetMinutes),
                linkedGoalId: editingHabit.linkedGoalId,
                isPrayer: editingHabit.isPrayer
              });
              setEditingHabit(null);
            }} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--text-muted)', display: 'block', marginBottom: '0.35rem' }}>Habit Title</label>
                <input
                  type="text"
                  value={editingHabit.title || ''}
                  onChange={(e) => setEditingHabit({ ...editingHabit, title: e.target.value })}
                  style={{ width: '100%', background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: '8px', padding: '0.6rem 0.85rem', color: 'var(--text-heading)', fontSize: '0.88rem', outline: 'none' }}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--text-muted)', display: 'block', marginBottom: '0.35rem' }}>Category</label>
                  <select
                    value={editingHabit.category || 'PRODUCTIVITY'}
                    onChange={(e) => setEditingHabit({ ...editingHabit, category: e.target.value })}
                    style={{ width: '100%', background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: '8px', padding: '0.6rem 0.85rem', color: 'var(--text-heading)', fontSize: '0.85rem', outline: 'none' }}
                  >
                    {HABIT_CATEGORIES.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--text-muted)', display: 'block', marginBottom: '0.35rem' }}>Time Block</label>
                  <select
                    value={editingHabit.window || 'MORNING'}
                    onChange={(e) => setEditingHabit({ ...editingHabit, window: e.target.value })}
                    style={{ width: '100%', background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: '8px', padding: '0.6rem 0.85rem', color: 'var(--text-heading)', fontSize: '0.85rem', outline: 'none' }}
                  >
                    {CONTEXTUAL_WINDOWS.map(win => (
                      <option key={win.id} value={win.id}>{win.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--text-muted)', display: 'block', marginBottom: '0.35rem' }}>Target Minutes</label>
                  <input
                    type="number"
                    min="1"
                    max="300"
                    value={editingHabit.targetMinutes || 15}
                    onChange={(e) => setEditingHabit({ ...editingHabit, targetMinutes: e.target.value })}
                    style={{ width: '100%', background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: '8px', padding: '0.6rem 0.85rem', color: 'var(--text-heading)', fontSize: '0.88rem', outline: 'none' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--text-muted)', display: 'block', marginBottom: '0.35rem' }}>Prayer Routine?</label>
                  <select
                    value={editingHabit.isPrayer ? 'TRUE' : 'FALSE'}
                    onChange={(e) => setEditingHabit({ ...editingHabit, isPrayer: e.target.value === 'TRUE' })}
                    style={{ width: '100%', background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: '8px', padding: '0.6rem 0.85rem', color: 'var(--text-heading)', fontSize: '0.85rem', outline: 'none' }}
                  >
                    <option value="FALSE">⚡ Standard Habit</option>
                    <option value="TRUE">🕌 Prayer Routine</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--text-muted)', display: 'block', marginBottom: '0.35rem' }}>🎯 Link Parent Goal Target</label>
                <select
                  value={editingHabit.linkedGoalId || ''}
                  onChange={(e) => setEditingHabit({ ...editingHabit, linkedGoalId: e.target.value })}
                  style={{ width: '100%', background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: '8px', padding: '0.6rem 0.85rem', color: 'var(--text-heading)', fontSize: '0.85rem', outline: 'none' }}
                >
                  <option value="">-- No Linked Goal --</option>
                  {goals.map(g => (
                    <option key={g.id} value={g.id}>{g.title} ({g.progressPercentage}%)</option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
                <Button type="button" variant="subtle" onClick={() => setEditingHabit(null)}>Cancel</Button>
                <Button type="submit" variant="emerald">Save Changes</Button>
              </div>
            </form>
          </div>
        </div>
      )}



      {/* 6. ROUTINE PREFERENCES & CUSTOM TIME BLOCKS MODAL */}
      <RoutinePreferencesModal
        isOpen={showPrefsModal}
        onClose={() => setShowPrefsModal(false)}
        routineMode={routineMode}
        selectedCityName={selectedCityName}
        timeBlocks={timeBlocks}
        isIslamicPreset={isIslamicPreset}
        onUpdateMode={updateRoutineMode}
        onUpdateCity={updateSelectedCity}
        onApplyPreset={(pack) => {
          applyPresetPack(pack);
        }}
        onAddTimeBlock={handleAddTimeBlock}
        onUpdateTimeBlock={handleUpdateTimeBlock}
        onDeleteTimeBlock={handleDeleteTimeBlock}
      />

      {/* 7. HABIT DELETION ENTERPRISE CONFIRMATION MODAL */}
      <ConfirmModal
        isOpen={!!habitToDelete}
        title={`Delete Habit "${habitToDelete?.title}"?`}
        message="Are you sure you want to delete this habit? All log history and streak momentum for this habit will be removed."
        confirmText="🗑️ Delete Habit"
        cancelText="Cancel"
        variant="danger"
        onConfirm={() => {
          if (habitToDelete) {
            handleDeleteHabit(habitToDelete.id);
            setHabitToDelete(null);
          }
        }}
        onClose={() => setHabitToDelete(null)}
      />
    </div>
  );
};
