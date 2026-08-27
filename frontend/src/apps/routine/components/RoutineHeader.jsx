import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '../../../components/ui/Button';

/**
 * 🌿 Routine Header & Window Navigation Component (Space-Optimized HUD)
 */
export const RoutineHeader = ({
  activeWindowTab,
  onSelectWindowTab,
  consistencyScore = 0,
  completedHabitsCount = 0,
  totalHabitsCount = 0,
  freezePasses = 0,
  routineMode = 'SOLAR',
  solarPhase,
  solarCutoff,
  onToggleSolar,
  onOpenPrefs,
  onOpenMuhasabah,
  onOpenAnalytics,
  onOpenAddModal
}) => {
  const WINDOW_TABS = [
    { key: 'MORNING', label: '🌅 Morning Block', keyName: 'morning' },
    { key: 'AFTERNOON', label: '☀️ Afternoon Block', keyName: 'afternoon' },
    { key: 'EVENING', label: '🌙 Evening Block', keyName: 'evening' }
  ];

  return (
    <div className="routine-header-card">
      {/* Top Banner Row: Title + Stats Pills + Action Suite */}
      <div className="routine-header-banner">
        
        <div>
          <div className="routine-header-tag">
            🌿 UNIVERSAL ROUTINE & HABIT ENGINE
          </div>
          <h2 className="routine-header-title">
            Daily Routine Blueprint
            {solarPhase && (
              <button type="button" onClick={onToggleSolar} className="solar-hud-badge">
                ☀️ {solarPhase} • {solarCutoff} ▾
              </button>
            )}
          </h2>
        </div>

        {/* Consolidated Daily Progress HUD */}
        <div className="routine-progress-hud-container">
          <div className="routine-progress-hud-stats">
            <span className="progress-value-label">
              🎯 {completedHabitsCount} / {totalHabitsCount} Completed
            </span>
            <div className="progress-badges-row">
              <span className="hud-badge streak">🔥 {consistencyScore}%</span>
              <span className="hud-badge freeze">❄️ {freezePasses}</span>
            </div>
          </div>
          <div className="routine-progress-hud-track">
            <div 
              className="routine-progress-hud-fill" 
              style={{ width: `${totalHabitsCount > 0 ? (completedHabitsCount / totalHabitsCount) * 100 : 0}%` }} 
            />
          </div>
        </div>

        {/* Action Controls Suite */}
        <div className="routine-header-actions-suite">
          
          <Button variant="emerald" onClick={onOpenAddModal} className="header-action-btn">
            🌿 + Habit
          </Button>

          <Button variant="secondary" onClick={onOpenMuhasabah} className="header-action-btn evening-audit-btn">
            🌙 Reflect
          </Button>

          <Button variant="outline" onClick={onOpenAnalytics} className="header-action-btn">
            📊 Stats
          </Button>

          <Button variant="outline" onClick={onOpenPrefs} className="header-action-btn">
            ⚙️ Settings
          </Button>

        </div>

      </div>

      {/* 3 Contextual Window Navigation Tabs */}
      <div className="routine-window-tab-bar">
        {WINDOW_TABS.map(w => {
          const isActive = activeWindowTab === w.key;
          return (
            <motion.button
              key={w.key}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onSelectWindowTab(w.key)}
              className={`window-tab-btn ${w.keyName} ${isActive ? 'active' : ''}`}
            >
              {w.label}
            </motion.button>
          );
        })}
      </div>

    </div>
  );
};
