import React, { useState, useRef, useEffect } from 'react';
import { useRoutine } from '../../hooks/useRoutine';
import { useProductivity } from '../../hooks/useProductivity';
import { RoutineHeader } from './components/RoutineHeader';
import { HabitCardItem } from './components/HabitCardItem';
import { SolarArcTimeline } from './components/SolarArcTimeline';
import { RoutinePreferencesModal } from './components/RoutinePreferencesModal';
import { ConsistencyHeatmap } from './components/ConsistencyHeatmap';
import { CategoryBalanceChart } from './components/CategoryBalanceChart';
import { PrayerAnalyticsDashboard } from './components/PrayerAnalyticsDashboard';
import { HabitFocusModal } from './components/HabitFocusModal';
import { MuhasabahModal } from './components/MuhasabahModal';
import { ConfirmModal } from '../../components/ui/ConfirmModal';
import { Button } from '../../components/ui/Button';
import { useToast } from '../../context/ToastContext';
import { requestNotificationPermission } from '../../utils/notificationEngine';
import { useSolarNotifications } from '../../hooks/useSolarNotifications';
import { HabitAddModal } from './components/HabitAddModal';
import './RoutineModule.css';

/**
 * 🌿 Routine & Habit Engine Master Executive Suite (Modular Clean Architecture)
 * Refactored & CSS De-cluttered.
 * 
 * @author Barkat Bashir
 * @version 16.0.0
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
    handleUpdateHabit, // Added missing update handler
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
  const [spiritualLayout, setSpiritualLayout] = useState(() => localStorage.getItem('spiritual_layout') || 'list');
  const [showSolarDrawer, setShowSolarDrawer] = useState(false);
  const [showAnalyticsDrawer, setShowAnalyticsDrawer] = useState(false);
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

  // Edit Habit State
  const [habitToEdit, setHabitToEdit] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const [editCategory, setEditCategory] = useState('PRODUCTIVITY');
  const [editWindow, setEditWindow] = useState('MORNING');
  const [editTargetMins, setEditTargetMins] = useState(15);

  const [editWindowDropdownOpen, setEditWindowDropdownOpen] = useState(false);
  const [editCategoryDropdownOpen, setEditCategoryDropdownOpen] = useState(false);
  const editWindowDropdownRef = useRef(null);
  const editCategoryDropdownRef = useRef(null);

  useEffect(() => {
    if (habitToEdit) {
      setEditTitle(habitToEdit.title || '');
      setEditCategory(habitToEdit.category || 'PRODUCTIVITY');
      setEditWindow(habitToEdit.window || 'MORNING');
      setEditTargetMins(habitToEdit.targetMinutes || 15);
    }
  }, [habitToEdit]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (editWindowDropdownRef.current && !editWindowDropdownRef.current.contains(event.target)) {
        setEditWindowDropdownOpen(false);
      }
      if (editCategoryDropdownRef.current && !editCategoryDropdownRef.current.contains(event.target)) {
        setEditCategoryDropdownOpen(false);
      }
    };
    if (habitToEdit) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [habitToEdit]);

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

  const isSpiritualHabit = (h) => {
    return h.category === 'SPIRITUAL' || h.isPrayer ||
      h.title?.toLowerCase().includes('prayer') ||
      h.title?.toLowerCase().includes('fajr') ||
      h.title?.toLowerCase().includes('dhuhr') ||
      h.title?.toLowerCase().includes('asr') ||
      h.title?.toLowerCase().includes('maghrib') ||
      h.title?.toLowerCase().includes('isha') ||
      h.title?.toLowerCase().includes('adhkar') ||
      h.title?.toLowerCase().includes('quran') ||
      h.title?.toLowerCase().includes('sadhana') ||
      h.title?.toLowerCase().includes('puja') ||
      h.title?.toLowerCase().includes('devotion') ||
      h.title?.toLowerCase().includes('bible');
  };

  const isFriday = new Date().getDay() === 5;
  const habitsFilteredByDay = habits.filter(h => {
    const titleLower = h.title?.toLowerCase() || '';
    if (titleLower.includes("jumu'ah") || titleLower.includes("jumuah")) {
      return isFriday;
    }
    return true;
  });

  const isIslamicPreset = habitsFilteredByDay.some(h => h.isPrayer || h.title?.toLowerCase().includes('prayer') || h.title?.toLowerCase().includes('fajr') || h.title?.toLowerCase().includes('dhuhr') || h.title?.toLowerCase().includes('asr') || h.title?.toLowerCase().includes('maghrib') || h.title?.toLowerCase().includes('isha'));

  const windowOrder = { MORNING: 1, AFTERNOON: 2, EVENING: 3 };
  const sortedSpiritualHabits = [...habitsFilteredByDay.filter(isSpiritualHabit)].sort((a, b) => {
    const orderA = windowOrder[(a.window || 'MORNING').toUpperCase()] || 1;
    const orderB = windowOrder[(b.window || 'MORNING').toUpperCase()] || 1;
    if (orderA !== orderB) return orderA - orderB;
    return (a.id || 0) - (b.id || 0);
  });

  const filteredLifestyleHabits = habitsFilteredByDay.filter(h => {
    if (isSpiritualHabit(h)) return false;
    const windowName = (h.window || 'MORNING').toUpperCase();
    return windowName === activeWindowTab;
  });

  const filteredHabits = habitsFilteredByDay.filter(h => {
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

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!habitToEdit || !editTitle.trim()) return;

    handleUpdateHabit(habitToEdit.id, {
      title: editTitle.trim(),
      category: editCategory,
      window: editWindow,
      targetMinutes: Number(editTargetMins)
    });

    setHabitToEdit(null);
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
      {isIslamicPreset && (
        <SolarArcTimeline
          selectedCity={selectedCity}
          onCityChange={updateSelectedCity}
          isExpanded={showSolarDrawer}
          onToggleExpand={() => setShowSolarDrawer(!showSolarDrawer)}
        />
      )}

      {/* 3. HABITS WORKSPACE GRID */}
      {sortedSpiritualHabits.length > 0 ? (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))',
          gap: '1.5rem',
          alignItems: 'flex-start',
          width: '100%'
        }}>
          {/* Left Column: Persistent Spiritual & Reflection Checklist */}
          <div style={{
            background: 'var(--bg-surface-elevated)',
            border: '1px solid var(--border-subtle)',
            borderRadius: '16px',
            padding: '1.25rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem',
            boxSizing: 'border-box'
          }}>
            <div style={{ borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.65rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ fontSize: '1rem', fontWeight: '800', color: 'var(--text-heading)', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  🕌 Spiritual & Reflection Routine
                </h3>
                <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', margin: '0.2rem 0 0 0' }}>
                  Your constant spiritual anchors throughout the day.
                </p>
              </div>

              {/* Segmented Layout Toggle Switch */}
              <div style={{ display: 'flex', background: 'rgba(255,255,255,0.05)', padding: '0.2rem', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
                <button
                  type="button"
                  onClick={() => {
                    setSpiritualLayout('list');
                    localStorage.setItem('spiritual_layout', 'list');
                  }}
                  style={{
                    background: spiritualLayout === 'list' ? 'var(--bg-surface-elevated)' : 'transparent',
                    border: 'none',
                    color: spiritualLayout === 'list' ? 'var(--text-heading)' : 'var(--text-muted)',
                    borderRadius: '6px',
                    padding: '0.25rem 0.5rem',
                    fontSize: '0.7rem',
                    fontWeight: '800',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                >
                  📝 List
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSpiritualLayout('grid');
                    localStorage.setItem('spiritual_layout', 'grid');
                  }}
                  style={{
                    background: spiritualLayout === 'grid' ? 'var(--bg-surface-elevated)' : 'transparent',
                    border: 'none',
                    color: spiritualLayout === 'grid' ? 'var(--text-heading)' : 'var(--text-muted)',
                    borderRadius: '6px',
                    padding: '0.25rem 0.5rem',
                    fontSize: '0.7rem',
                    fontWeight: '800',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                >
                  ⧉ Grid
                </button>
              </div>
            </div>

            {spiritualLayout === 'grid' ? (
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(170px, 1fr))',
                gap: '0.85rem'
              }}>
                {sortedSpiritualHabits.map(habit => (
                  <HabitCardItem
                    key={habit.id}
                    habit={habit}
                    layout="grid"
                    onCycleStatus={cycleHabitStatus}
                    onRateQuality={(id, grade) => setHabitQualityGrade(id, grade)}
                    onOpenFocus={(h) => setActiveFocusHabit(h)}
                    onEdit={(h) => setHabitToEdit(h)}
                    onDelete={(h) => setHabitToDelete(h)}
                  />
                ))}
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                {sortedSpiritualHabits.map(habit => {
                  const win = (habit.window || 'MORNING').toUpperCase();
                  const icon = win === 'MORNING' ? '🌅' : win === 'AFTERNOON' ? '☀️' : '🌙';
                  return (
                    <div key={habit.id} style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                      <div style={{ fontSize: '0.62rem', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginLeft: '0.2rem' }}>
                        {icon} {win} block
                      </div>
                      <HabitCardItem
                        habit={habit}
                        layout="list"
                        onCycleStatus={cycleHabitStatus}
                        onRateQuality={(id, grade) => setHabitQualityGrade(id, grade)}
                        onOpenFocus={(h) => setActiveFocusHabit(h)}
                        onEdit={(h) => setHabitToEdit(h)}
                        onDelete={(h) => setHabitToDelete(h)}
                      />
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Right Column: Contextual Lifestyle & Growth Checklist */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            <div style={{ background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-subtle)', borderRadius: '16px', padding: '1rem 1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ fontSize: '0.95rem', fontWeight: '800', color: 'var(--text-heading)', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  🌿 Lifestyle & Growth
                </h3>
                <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', margin: '0.15rem 0 0 0' }}>
                  Contextual habits for {activeWindowTab.toLowerCase()} window.
                </p>
              </div>
            </div>

            {filteredLifestyleHabits.length === 0 ? (
              <div style={{ background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-subtle)', borderRadius: '16px', padding: '3rem', textAlign: 'center' }}>
                <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🌿</div>
                <h4 style={{ fontSize: '1.1rem', fontWeight: '800', color: 'var(--text-heading)', margin: 0 }}>No habits in this window yet</h4>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', margin: '0.3rem 0 1rem 0' }}>Click "+ New Habit" to add an intentional task.</p>
                <Button variant="emerald" onClick={() => setShowAddModal(true)}>+ Add Habit to {activeWindowTab}</Button>
              </div>
            ) : (
              filteredLifestyleHabits.map(habit => (
                <HabitCardItem
                  key={habit.id}
                  habit={habit}
                  onCycleStatus={cycleHabitStatus}
                  onRateQuality={(id, grade) => setHabitQualityGrade(id, grade)}
                  onOpenFocus={(h) => setActiveFocusHabit(h)}
                  onEdit={(h) => setHabitToEdit(h)}
                  onDelete={(h) => setHabitToDelete(h)}
                />
              ))
            )}
          </div>
        </div>
      ) : (
        /* Original Single-Column View */
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
                onRateQuality={(id, grade) => setHabitQualityGrade(id, grade)}
                onOpenFocus={(h) => setActiveFocusHabit(h)}
                onEdit={(h) => setHabitToEdit(h)}
                onDelete={(h) => setHabitToDelete(h)}
              />
            ))
          )}
        </div>
      )}

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
                  justifyContent: 'center',
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

      {/* Add / Edit Habit Modal */}
      <HabitAddModal
        showAddModal={showAddModal}
        setShowAddModal={setShowAddModal}
        newTitle={newTitle}
        setNewTitle={setNewTitle}
        newCategory={newCategory}
        setNewCategory={setNewCategory}
        newWindow={newWindow}
        setNewWindow={setNewWindow}
        newTargetMins={newTargetMins}
        setNewTargetMins={setNewTargetMins}
        windowDropdownOpen={windowDropdownOpen}
        setWindowDropdownOpen={setWindowDropdownOpen}
        categoryDropdownOpen={categoryDropdownOpen}
        setCategoryDropdownOpen={setCategoryDropdownOpen}
        windowDropdownRef={windowDropdownRef}
        categoryDropdownRef={categoryDropdownRef}
        onSubmitNewHabit={handleAddSubmit}

        habitToEdit={habitToEdit}
        setHabitToEdit={setHabitToEdit}
        editTitle={editTitle}
        setEditTitle={setEditTitle}
        editCategory={editCategory}
        setEditCategory={setEditCategory}
        editWindow={editWindow}
        setEditWindow={setEditWindow}
        editTargetMins={editTargetMins}
        setEditTargetMins={setEditTargetMins}
        editWindowDropdownOpen={editWindowDropdownOpen}
        setEditWindowDropdownOpen={setEditWindowDropdownOpen}
        editCategoryDropdownOpen={editCategoryDropdownOpen}
        setEditCategoryDropdownOpen={setEditCategoryDropdownOpen}
        editWindowDropdownRef={editWindowDropdownRef}
        editCategoryDropdownRef={editCategoryDropdownRef}
        onSubmitEditHabit={handleEditSubmit}
      />

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
