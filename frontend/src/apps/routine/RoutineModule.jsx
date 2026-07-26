import React, { useState, useRef, useEffect } from 'react';
import { useRoutine } from '../../hooks/useRoutine';
import { useProductivity } from '../../hooks/useProductivity';
import { RoutineHeader } from './components/RoutineHeader';
import { HabitCardItem } from './components/HabitCardItem';
import { SolarArcTimeline } from './components/SolarArcTimeline';
import { HabitQualityPopover } from './components/HabitQualityPopover';
import { RoutinePreferencesModal } from './components/RoutinePreferencesModal';
import { ConsistencyHeatmap } from './components/ConsistencyHeatmap';
import { CategoryBalanceChart } from './components/CategoryBalanceChart';
import { PrayerAnalyticsDashboard } from './components/PrayerAnalyticsDashboard';
import { HabitFocusModal } from './components/HabitFocusModal';
import { MuhasabahModal } from './components/MuhasabahModal';
import { MuhasabahJournal } from './components/MuhasabahJournal';
import { ConfirmModal } from '../../components/ui/ConfirmModal';
import { Button } from '../../components/ui/Button';
import { useToast } from '../../context/ToastContext';
import { requestNotificationPermission } from '../../utils/notificationEngine';
import { useSolarNotifications } from '../../hooks/useSolarNotifications';
import './RoutineModule.css';

/**
 * 🌿 Routine & Habit Engine Master Executive Suite (Modular Clean Architecture)
 * 
 * Features:
 * 1. 3 Contextual Time Windows (Morning, Afternoon, Evening)
 * 2. 60 FPS 3-State Tap Toggling (0% -> 50% -> 100%)
 * 3. Persisted Location & Solstice Calculations (Fixed Lat/Lng Bug!)
 * 4. 30-Day Rolling Consistency Score & Muhasabah Audit
 * 
 * @author Barkat Bashir
 * @version 3.0.0
 */
export const RoutineModule = () => {
  const {
    habits,
    historyLogs,
    loadingHistory,
    fetchAnalyticsHistory,
    freezePasses,
    routineMode,
    selectedCity,
    timeBlocks,
    updateRoutineMode,
    updateSelectedCity,
    consistencyScore,
    completedHabitsCount,
    cycleHabitStatus,
    setHabitQualityGrade,
    applyPresetPack,
    handleCreateHabit,
    handleDeleteHabit,
    handleUpdateTimeBlock,
    handleDeleteTimeBlock,
    handleAddTimeBlock
  } = useRoutine();

  const { goals } = useProductivity();

  // Auto-detect default time window
  const currentHour = new Date().getHours();
  const defaultTab = currentHour >= 6 && currentHour < 12 ? 'MORNING' : currentHour >= 12 && currentHour < 18 ? 'AFTERNOON' : 'EVENING';
  const [activeWindowTab, setActiveWindowTab] = useState(defaultTab);
  
  // UI State Controls
  const [showSolarDrawer, setShowSolarDrawer] = useState(false);
  const [showAnalyticsDrawer, setShowAnalyticsDrawer] = useState(false);
  const [popoverHabitId, setPopoverHabitId] = useState(null);
  const [habitToDelete, setHabitToDelete] = useState(null);
  const [activeFocusHabit, setActiveFocusHabit] = useState(null);
  const [showPrefsModal, setShowPrefsModal] = useState(false);
  const [showMuhasabahModal, setShowMuhasabahModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);

  // New Habit State
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState('PRODUCTIVITY');
  const [newWindow, setNewWindow] = useState('MORNING');
  const [newTargetMins, setNewTargetMins] = useState(15);

  const [windowDropdownOpen, setWindowDropdownOpen] = useState(false);
  const [categoryDropdownOpen, setCategoryDropdownOpen] = useState(false);
  const windowDropdownRef = useRef(null);
  const categoryDropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (windowDropdownRef.current && !windowDropdownRef.current.contains(event.target)) {
        setWindowDropdownOpen(false);
      }
      if (categoryDropdownRef.current && !categoryDropdownRef.current.contains(event.target)) {
        setCategoryDropdownOpen(false);
      }
    };
    if (showAddModal) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showAddModal]);

  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [audioEnabled, setAudioEnabled] = useState(true);

  const { showSuccess, showError } = useToast();

  useSolarNotifications({ selectedCity, notificationsEnabled, audioEnabled });

  const handleToggleNotifications = async () => {
    if (!notificationsEnabled) {
      const perm = await requestNotificationPermission();
      if (perm === 'granted') {
        setNotificationsEnabled(true);
        showSuccess('🔔 Web Notifications Enabled! Solar cutoff alerts active.');
      } else {
        showError('⚠️ Browser Notification Permission denied.');
      }
    } else {
      setNotificationsEnabled(false);
    }
  };

  const isIslamicPreset = habits.some(h => h.isPrayer || h.title?.toLowerCase().includes('prayer') || h.title?.toLowerCase().includes('fajr') || h.title?.toLowerCase().includes('dhuhr') || h.title?.toLowerCase().includes('asr') || h.title?.toLowerCase().includes('maghrib') || h.title?.toLowerCase().includes('isha'));

  const filteredHabits = habits.filter(h => {
    const windowName = (h.window || 'MORNING').toUpperCase();
    return windowName === activeWindowTab;
  });

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    await handleCreateHabit({
      title: newTitle.trim(),
      category: newCategory,
      window: newWindow,
      targetMinutes: Number(newTargetMins)
    });

    setNewTitle('');
    setShowAddModal(false);
    showSuccess('🌿 Habit created successfully!');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', width: '100%', maxWidth: '1400px', margin: '0 auto' }}>
      
      {/* 1. MODULAR ROUTINE HEADER & WINDOW TABS */}
      <RoutineHeader
        activeWindowTab={activeWindowTab}
        onSelectWindowTab={setActiveWindowTab}
        consistencyScore={consistencyScore}
        completedHabitsCount={completedHabitsCount}
        totalHabitsCount={habits.length}
        freezePasses={freezePasses}
        routineMode={routineMode}
        onOpenPrefs={() => setShowPrefsModal(true)}
        onOpenMuhasabah={() => setShowMuhasabahModal(true)}
        onOpenAnalytics={() => {
          setShowAnalyticsDrawer(!showAnalyticsDrawer);
          if (!showAnalyticsDrawer) fetchAnalyticsHistory();
        }}
        onOpenAddModal={() => setShowAddModal(true)}
      />

      {/* 2. SOLAR HORIZON STRIP & SOLSTICE DRAWER */}
      <SolarArcTimeline
        selectedCity={selectedCity}
        onCityChange={updateSelectedCity}
        isExpanded={showSolarDrawer}
        onToggleExpand={() => setShowSolarDrawer(!showSolarDrawer)}
      />

      {/* 3. ACTIVE CONTEXTUAL WINDOW CHECKLIST */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
        {filteredHabits.length === 0 ? (
          <div style={{ background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-subtle)', borderRadius: '16px', padding: '3rem', textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🌿</div>
            <h4 style={{ fontSize: '1.1rem', fontWeight: '800', color: 'var(--text-heading)', margin: 0 }}>No habits in this window yet</h4>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', margin: '0.3rem 0 1rem 0' }}>Click "+ New Habit" to add an intentional daily habit to your {activeWindowTab.toLowerCase()} routine.</p>
            <Button variant="emerald" onClick={() => setShowAddModal(true)}>+ Add Habit to {activeWindowTab}</Button>
          </div>
        ) : (
          filteredHabits.map(habit => (
            <HabitCardItem
              key={habit.id}
              habit={habit}
              onCycleStatus={cycleHabitStatus}
              onOpenPopover={(id) => setPopoverHabitId(id)}
              onOpenFocus={(h) => setActiveFocusHabit(h)}
              onEdit={(h) => {}}
              onDelete={(h) => setHabitToDelete(h)}
            />
          ))
        )}
      </div>

      {/* 4. SLIDING RIGHT-SIDE ANALYTICS DRAWER & OVERLAY */}
      {showAnalyticsDrawer && (
        <>
          {/* Blur Backdrop */}
          <div
            onClick={() => setShowAnalyticsDrawer(false)}
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(0, 0, 0, 0.4)',
              backdropFilter: 'blur(4px)',
              zIndex: 9998,
              transition: 'opacity 0.25s ease'
            }}
          />

          {/* Sliding Panel */}
          <div
            style={{
              position: 'fixed',
              top: 0,
              right: 0,
              width: '100%',
              maxWidth: '520px',
              height: '100vh',
              background: 'rgba(15, 15, 20, 0.95)',
              backdropFilter: 'blur(24px)',
              borderLeft: '1px solid var(--border-subtle)',
              boxShadow: '-10px 0 35px rgba(0, 0, 0, 0.6)',
              zIndex: 9999,
              padding: '1.5rem',
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column',
              gap: '1.5rem',
              boxSizing: 'border-box',
              animation: 'slideIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards'
            }}
          >
            {/* Inject dynamic CSS animation rules for smooth sliding */}
            <style>{`
              @keyframes slideIn {
                from { transform: translateX(100%); }
                to { transform: translateX(0); }
              }
            `}</style>

            {/* Drawer Header Controls */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.75rem' }}>
              <div>
                <h2 style={{ fontSize: '1.2rem', fontWeight: '900', color: 'var(--text-heading)', margin: 0 }}>
                  📊 Analytics Dashboard
                </h2>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: '0.15rem 0 0 0' }}>
                  Routine compliance and solstice insights.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowAnalyticsDrawer(false)}
                style={{
                  background: 'var(--bg-surface)',
                  border: '1px solid var(--border-subtle)',
                  color: 'var(--text-heading)',
                  borderRadius: '50%',
                  width: '32px',
                  height: '32px',
                  display: 'flex',
                  alignItems: 'center',
                  justify: 'center',
                  fontSize: '0.9rem',
                  fontWeight: '700',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
                title="Close Dashboard"
              >
                ✕
              </button>
            </div>

            {/* Dashboard Visual Components */}
            <ConsistencyHeatmap historyLogs={historyLogs} habits={habits} />
            <CategoryBalanceChart habits={habits} />
            {isIslamicPreset && (
              <PrayerAnalyticsDashboard historyLogs={historyLogs} habits={habits} />
            )}
          </div>
        </>
      )}

      {/* 5. MODALS & POPOVERS */}
      <RoutinePreferencesModal
        isOpen={showPrefsModal}
        onClose={() => setShowPrefsModal(false)}
        routineMode={routineMode}
        selectedCityName={typeof selectedCity === 'object' ? selectedCity.name : selectedCity}
        selectedCity={selectedCity}
        timeBlocks={timeBlocks}
        isIslamicPreset={isIslamicPreset}
        notificationsEnabled={notificationsEnabled}
        audioEnabled={audioEnabled}
        onToggleNotifications={handleToggleNotifications}
        onToggleAudio={() => setAudioEnabled(!audioEnabled)}
        onUpdateMode={updateRoutineMode}
        onUpdateCity={updateSelectedCity}
        onApplyPreset={applyPresetPack}
        onAddTimeBlock={handleAddTimeBlock}
        onUpdateTimeBlock={handleUpdateTimeBlock}
        onDeleteTimeBlock={handleDeleteTimeBlock}
        habits={habits}
      />

      {popoverHabitId && (
        <HabitQualityPopover
          habit={habits.find(h => h.id === popoverHabitId)}
          onClose={() => setPopoverHabitId(null)}
          onSelectGrade={(habitId, grade) => {
            setHabitQualityGrade(habitId, grade);
            setPopoverHabitId(null);
          }}
        />
      )}

      {activeFocusHabit && (
        <HabitFocusModal
          habit={activeFocusHabit}
          onClose={() => setActiveFocusHabit(null)}
          onComplete={() => {
            cycleHabitStatus(activeFocusHabit.id);
            setActiveFocusHabit(null);
          }}
        />
      )}

      <MuhasabahModal
        isOpen={showMuhasabahModal}
        onClose={() => setShowMuhasabahModal(false)}
      />

      {/* Add Habit Modal */}
      {showAddModal && (
        <div className="modal-overlay" style={{ zIndex: 10000 }}>
          <div className="modal-dialog wallet-modal" style={{ maxWidth: '480px' }}>
            <div className="modal-header">
              <h3 className="modal-title">🌿 Create New Habit</h3>
              <button type="button" onClick={() => setShowAddModal(false)} className="modal-close-btn">✕</button>
            </div>

            <form onSubmit={handleAddSubmit} className="modal-form">
              <div>
                <label className="form-label">Habit Name</label>
                <input
                  type="text"
                  placeholder="e.g. 15-Min Solar Reflection"
                  value={newTitle}
                  onChange={e => setNewTitle(e.target.value)}
                  className="form-input"
                  required
                  autoFocus
                />
              </div>

              <div ref={windowDropdownRef} style={{ position: 'relative', display: 'flex', flexDirection: 'column', gap: '0.4rem', marginTop: '1rem' }}>
                <label className="form-label">Contextual Window</label>
                <button
                  type="button"
                  onClick={() => setWindowDropdownOpen(!windowDropdownOpen)}
                  style={{
                    width: '100%',
                    background: 'var(--bg-surface-elevated, #1a1a20)',
                    border: '1px solid var(--border-subtle)',
                    color: 'var(--text-heading)',
                    borderRadius: '8px',
                    padding: '0.65rem 1rem',
                    fontSize: '0.85rem',
                    fontWeight: '700',
                    cursor: 'pointer',
                    textAlign: 'left',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    boxSizing: 'border-box',
                    outline: 'none'
                  }}
                >
                  <span>
                    {newWindow === 'MORNING' && '🌅 Morning Block'}
                    {newWindow === 'AFTERNOON' && '☀️ Afternoon Block'}
                    {newWindow === 'EVENING' && '🌙 Evening Block'}
                  </span>
                  <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>{windowDropdownOpen ? '▲' : '▼'}</span>
                </button>

                {windowDropdownOpen && (
                  <div
                    style={{
                      position: 'absolute',
                      top: '100%',
                      left: 0,
                      width: '100%',
                      background: 'var(--bg-dropdown-surface, #0E131F)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: '8px',
                      boxShadow: '0 8px 24px rgba(0, 0, 0, 0.4)',
                      zIndex: 10100,
                      padding: '0.35rem 0',
                      boxSizing: 'border-box',
                      marginTop: '4px'
                    }}
                  >
                    {[
                      { val: 'MORNING', label: '🌅 Morning Block' },
                      { val: 'AFTERNOON', label: '☀️ Afternoon Block' },
                      { val: 'EVENING', label: '🌙 Evening Block' }
                    ].map(item => {
                      const isSelected = newWindow === item.val;
                      return (
                        <div
                          key={item.val}
                          onClick={() => {
                            setNewWindow(item.val);
                            setWindowDropdownOpen(false);
                          }}
                          style={{
                            padding: '0.6rem 1rem',
                            fontSize: '0.8rem',
                            fontWeight: isSelected ? '800' : '600',
                            color: isSelected ? 'var(--accent-primary, #6366F1)' : 'var(--text-heading)',
                            background: isSelected ? 'rgba(99, 102, 241, 0.1)' : 'transparent',
                            cursor: 'pointer',
                            transition: 'all 0.15s ease'
                          }}
                          onMouseEnter={(e) => {
                            if (!isSelected) e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                          }}
                          onMouseLeave={(e) => {
                            if (!isSelected) e.currentTarget.style.background = 'transparent';
                          }}
                        >
                          {item.label}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              <div ref={categoryDropdownRef} style={{ position: 'relative', display: 'flex', flexDirection: 'column', gap: '0.4rem', marginTop: '1rem' }}>
                <label className="form-label">Category</label>
                <button
                  type="button"
                  onClick={() => setCategoryDropdownOpen(!categoryDropdownOpen)}
                  style={{
                    width: '100%',
                    background: 'var(--bg-surface-elevated, #1a1a20)',
                    border: '1px solid var(--border-subtle)',
                    color: 'var(--text-heading)',
                    borderRadius: '8px',
                    padding: '0.65rem 1rem',
                    fontSize: '0.85rem',
                    fontWeight: '700',
                    cursor: 'pointer',
                    textAlign: 'left',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    boxSizing: 'border-box',
                    outline: 'none'
                  }}
                >
                  <span>
                    {newCategory === 'PRODUCTIVITY' && '🎯 Productivity'}
                    {newCategory === 'HEALTH' && '🌿 Health & Fitness'}
                    {newCategory === 'MINDFULNESS' && '🧘 Mindfulness'}
                    {newCategory === 'LEARNING' && '📖 Learning'}
                  </span>
                  <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>{categoryDropdownOpen ? '▲' : '▼'}</span>
                </button>

                {categoryDropdownOpen && (
                  <div
                    style={{
                      position: 'absolute',
                      top: '100%',
                      left: 0,
                      width: '100%',
                      background: 'var(--bg-dropdown-surface, #0E131F)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: '8px',
                      boxShadow: '0 8px 24px rgba(0, 0, 0, 0.4)',
                      zIndex: 10100,
                      padding: '0.35rem 0',
                      boxSizing: 'border-box',
                      marginTop: '4px'
                    }}
                  >
                    {[
                      { val: 'PRODUCTIVITY', label: '🎯 Productivity' },
                      { val: 'HEALTH', label: '🌿 Health & Fitness' },
                      { val: 'MINDFULNESS', label: '🧘 Mindfulness' },
                      { val: 'LEARNING', label: '📖 Learning' }
                    ].map(item => {
                      const isSelected = newCategory === item.val;
                      return (
                        <div
                          key={item.val}
                          onClick={() => {
                            setNewCategory(item.val);
                            setCategoryDropdownOpen(false);
                          }}
                          style={{
                            padding: '0.6rem 1rem',
                            fontSize: '0.8rem',
                            fontWeight: isSelected ? '800' : '600',
                            color: isSelected ? 'var(--accent-primary, #6366F1)' : 'var(--text-heading)',
                            background: isSelected ? 'rgba(99, 102, 241, 0.1)' : 'transparent',
                            cursor: 'pointer',
                            transition: 'all 0.15s ease'
                          }}
                          onMouseEnter={(e) => {
                            if (!isSelected) e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                          }}
                          onMouseLeave={(e) => {
                            if (!isSelected) e.currentTarget.style.background = 'transparent';
                          }}
                        >
                          {item.label}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              <div>
                <label className="form-label">Target Duration (Minutes)</label>
                <input
                  type="number"
                  min="5"
                  max="180"
                  value={newTargetMins}
                  onChange={e => setNewTargetMins(e.target.value)}
                  className="form-input"
                  required
                />
              </div>

              <div className="form-actions" style={{ justifyContent: 'flex-end', marginTop: '1rem' }}>
                <Button type="button" variant="secondary" onClick={() => setShowAddModal(false)}>Cancel</Button>
                <Button type="submit" variant="emerald">✨ Create Habit →</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={!!habitToDelete}
        onClose={() => setHabitToDelete(null)}
        onConfirm={() => {
          handleDeleteHabit(habitToDelete.id);
          setHabitToDelete(null);
          showSuccess('🗑️ Habit deleted successfully');
        }}
        title="Delete Habit"
        message={`Are you sure you want to delete "${habitToDelete?.title}"?`}
        confirmText="Delete"
        danger
      />

    </div>
  );
};
