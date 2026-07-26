import React, { useState } from 'react';
import { useRoutine } from '../../hooks/useRoutine';
import { useProductivity } from '../../hooks/useProductivity';
import { RoutineHeader } from './components/RoutineHeader';
import { HabitCardItem } from './components/HabitCardItem';
import { SolarArcTimeline } from './components/SolarArcTimeline';
import { HabitQualityPopover } from './components/HabitQualityPopover';
import { RoutinePreferencesModal } from './components/RoutinePreferencesModal';
import { ConsistencyHeatmap } from './components/ConsistencyHeatmap';
import { CategoryBalanceChart } from './components/CategoryBalanceChart';
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

      {/* 4. ANALYTICS & CONSISTENCY HEATMAP DRAWER */}
      {showAnalyticsDrawer && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(450px, 1fr))', gap: '1.5rem', marginTop: '1rem' }}>
          <ConsistencyHeatmap logs={historyLogs} loading={loadingHistory} />
          <CategoryBalanceChart habits={habits} />
        </div>
      )}

      {/* 5. MODALS & POPOVERS */}
      <RoutinePreferencesModal
        isOpen={showPrefsModal}
        onClose={() => setShowPrefsModal(false)}
        routineMode={routineMode}
        selectedCityName={selectedCity.name}
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
      />

      <HabitQualityPopover
        isOpen={!!popoverHabitId}
        onClose={() => setPopoverHabitId(null)}
        onSelectQuality={(grade) => {
          setHabitQualityGrade(popoverHabitId, grade);
          setPopoverHabitId(null);
        }}
      />

      <HabitFocusModal
        isOpen={!!activeFocusHabit}
        onClose={() => setActiveFocusHabit(null)}
        habit={activeFocusHabit}
      />

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

              <div>
                <label className="form-label">Contextual Window</label>
                <select
                  value={newWindow}
                  onChange={e => setNewWindow(e.target.value)}
                  className="form-input"
                  style={{ background: 'var(--bg-surface)' }}
                >
                  <option value="MORNING">🌅 Morning Block</option>
                  <option value="AFTERNOON">☀️ Afternoon Block</option>
                  <option value="EVENING">🌙 Evening Block</option>
                </select>
              </div>

              <div>
                <label className="form-label">Category</label>
                <select
                  value={newCategory}
                  onChange={e => setNewCategory(e.target.value)}
                  className="form-input"
                  style={{ background: 'var(--bg-surface)' }}
                >
                  <option value="PRODUCTIVITY">🎯 Productivity</option>
                  <option value="HEALTH">🌿 Health & Fitness</option>
                  <option value="MINDFULNESS">🧘 Mindfulness</option>
                  <option value="LEARNING">📖 Learning</option>
                </select>
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
