import React, { useState, useRef, useEffect } from 'react';
import { useRoutine } from '../../hooks/useRoutine';
import { useProductivity } from '../../hooks/useProductivity';
import { RoutineHeader } from './components/RoutineHeader';
import { HabitCardItem } from './components/HabitCardItem';
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
import { calculateSolarBoundaries, calculateSolarBoundariesAsync } from '../../utils/solarCalculator';
import './RoutineModule.css';

/**
 * 🌿 Routine & Habit Engine Master Executive Suite (Modular Clean Architecture)
 * Decluttered & Real Estate Optimized.
 * 
 * @author Barkat Bashir
 * @version 17.0.0
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
    handleUpdateHabit,
    handleUpdateTimeBlock,
    handleDeleteTimeBlock,
    handleAddTimeBlock,
    handleSaveMuhasabah
  } = useRoutine();

  const { goals } = useProductivity();

  // Auto-detect default time window
  const currentHour = new Date().getHours();
  const defaultTab = currentHour >= 6 && currentHour < 12 ? 'MORNING' : currentHour >= 12 && currentHour < 18 ? 'AFTERNOON' : 'EVENING';
  const [activeWindowTab, setActiveWindowTab] = useState(defaultTab);
  
  // UI State Controls
  const [activeCategoryTab, setActiveCategoryTab] = useState('ALL');
  const [showSolarPopover, setShowSolarPopover] = useState(false);
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

  // Solar calculations integration
  const [solarData, setSolarData] = useState(() => calculateSolarBoundaries(selectedCity));

  useEffect(() => {
    let isMounted = true;
    const update = async () => {
      try {
        const asyncData = await calculateSolarBoundariesAsync(selectedCity);
        if (isMounted && asyncData) {
          setSolarData(asyncData);
        }
      } catch (err) {
        if (isMounted) {
          setSolarData(calculateSolarBoundaries(selectedCity));
        }
      }
    };
    update();
    const timer = setInterval(update, 30000);
    return () => {
      isMounted = false;
      clearInterval(timer);
    };
  }, [selectedCity]);

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

  // Filter checklist items for the unified column view
  const habitsToRender = habitsFilteredByDay.filter(h => {
    if (activeCategoryTab === 'SPIRITUAL') {
      return isSpiritualHabit(h);
    }
    if (activeCategoryTab === 'LIFESTYLE') {
      return !isSpiritualHabit(h) && (h.window || 'MORNING').toUpperCase() === activeWindowTab;
    }
    // ALL view: contextual time habits plus persistent spiritual anchors
    return (h.window || 'MORNING').toUpperCase() === activeWindowTab || isSpiritualHabit(h);
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
    <div className="routine-module-wrapper">
      
      {/* 1. MODULAR ROUTINE HEADER & WINDOW TABS */}
      <RoutineHeader
        activeWindowTab={activeWindowTab}
        onSelectWindowTab={setActiveWindowTab}
        consistencyScore={consistencyScore}
        completedHabitsCount={completedHabitsCount}
        totalHabitsCount={habits.length}
        freezePasses={freezePasses}
        routineMode={routineMode}
        solarPhase={isIslamicPreset ? solarData.currentPhaseLabel : null}
        solarCutoff={isIslamicPreset ? solarData.nextCutoffLabel : null}
        onToggleSolar={() => setShowSolarPopover(!showSolarPopover)}
        onOpenPrefs={() => setShowPrefsModal(true)}
        onOpenMuhasabah={() => setShowMuhasabahModal(true)}
        onOpenAnalytics={() => {
          setShowAnalyticsDrawer(!showAnalyticsDrawer);
          if (!showAnalyticsDrawer) fetchAnalyticsHistory();
        }}
        onOpenAddModal={() => setShowAddModal(true)}
      />

      {/* 2. SOLAR TIMES FLOATING POPOVER */}
      {showSolarPopover && isIslamicPreset && (
        <>
          <div className="popover-blur-backdrop" onClick={() => setShowSolarPopover(false)} />
          <div className="solar-popover-card">
            <h4 className="solar-popover-title">
              📍 Solstice Times ({typeof selectedCity === 'object' ? selectedCity.name : selectedCity})
            </h4>
            <div className="solar-popover-grid">
              {[
                { label: 'Fajr', time: solarData.fajrStr, icon: '🌅' },
                { label: 'Sunrise', time: solarData.sunriseStr, icon: '☀️' },
                { label: 'Dhuhr', time: solarData.dhuhrStr, icon: '🌤️' },
                { label: 'Asr', time: solarData.asrStr, icon: '⛅' },
                { label: 'Maghrib', time: solarData.maghribStr, icon: '🌇' },
                { label: 'Isha', time: solarData.ishaStr, icon: '🌙' }
              ].map((item, idx) => (
                <div key={idx} className="solar-popover-item">
                  <span className="solar-popover-item-label">{item.icon} {item.label}</span>
                  <span className="solar-popover-item-time font-mono">{item.time}</span>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {/* 3. HABITS WORKSPACE GRID (UNIFIED SINGLE COLUMN FLOW) */}
      <div className="unified-habits-flow-panel">
        <div className="habits-filter-header">
          {/* Category Filter Tabs */}
          <div className="category-filter-tabs">
            <button
              onClick={() => setActiveCategoryTab('ALL')}
              className={`category-tab-btn ${activeCategoryTab === 'ALL' ? 'active' : ''}`}
            >
              📋 All Contexts ({habitsFilteredByDay.filter(h => (h.window || 'MORNING').toUpperCase() === activeWindowTab || isSpiritualHabit(h)).length})
            </button>
            <button
              onClick={() => setActiveCategoryTab('SPIRITUAL')}
              className={`category-tab-btn ${activeCategoryTab === 'SPIRITUAL' ? 'active' : ''}`}
            >
              🕌 Spiritual Anchors ({sortedSpiritualHabits.length})
            </button>
            <button
              onClick={() => setActiveCategoryTab('LIFESTYLE')}
              className={`category-tab-btn ${activeCategoryTab === 'LIFESTYLE' ? 'active' : ''}`}
            >
              🌿 Lifestyle & Growth ({filteredLifestyleHabits.length})
            </button>
          </div>
        </div>

        {habitsToRender.length === 0 ? (
          <div className="routine-empty-panel">
            <div className="empty-icon-label">🌿</div>
            <h4 className="empty-panel-title">No habits found in this view</h4>
            <p className="empty-panel-subtitle">Get started by creating a new intentional daily routine.</p>
            <Button variant="emerald" onClick={() => setShowAddModal(true)}>+ Add Intentional Habit</Button>
          </div>
        ) : (
          <div className="spiritual-habits-list">
            {habitsToRender.map(habit => {
              const isSpiritual = isSpiritualHabit(habit);
              const win = (habit.window || 'MORNING').toUpperCase();
              const icon = win === 'MORNING' ? '🌅' : win === 'AFTERNOON' ? '☀️' : '🌙';
              return (
                <div key={habit.id} className="spiritual-habit-item-wrap">
                  {isSpiritual && activeCategoryTab === 'ALL' && (
                    <div className="spiritual-habit-block-label">
                      🕌 Spiritual Anchor ({icon} {win} block)
                    </div>
                  )}
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

      {/* 4. SLIDING RIGHT-SIDE ANALYTICS DRAWER & OVERLAY */}
      {showAnalyticsDrawer && (
        <>
          {/* Blur Backdrop */}
          <div
            onClick={() => setShowAnalyticsDrawer(false)}
            className="drawer-blur-backdrop"
          />

          {/* Sliding Panel */}
          <div className="drawer-sliding-panel">
            {/* Drawer Header Controls */}
            <div className="drawer-header-row">
              <div>
                <h2 className="drawer-header-title">
                  📊 Analytics Dashboard
                </h2>
                <p className="drawer-header-subtitle">
                  Routine compliance and solstice insights.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowAnalyticsDrawer(false)}
                className="drawer-close-btn"
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
        completedCount={completedHabitsCount}
        totalCount={habits.length}
        onSaveMuhasabah={handleSaveMuhasabah}
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
