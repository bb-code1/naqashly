import React from 'react';
import { Button } from '../../../components/ui/Button';

/**
 * 🎯 Productivity Header & Actions Component
 * Decluttered & Space-Optimized HUD layout.
 */
export const ProductivityHeader = ({
  focusStreak = 0,
  avgGoalProgress = 0,
  completedTasksCount = 0,
  totalFocusHoursLogged = 0,
  onOpenGoalModal,
  onOpenTaskModal,
  onOpenAnalytics
}) => {
  return (
    <div className="productivity-header-card">
      <div className="productivity-header-banner">
        
        <div>
          <div className="productivity-header-tag">
            🎯 FOCUS & GOAL PERFORMANCE SYSTEM
          </div>
          <h2 className="productivity-header-title">
            Goal Performance
          </h2>
        </div>

        {/* Consolidated Productivity Progress HUD */}
        <div className="productivity-progress-hud-container">
          <div className="productivity-progress-hud-stats">
            <span className="progress-value-label">
              🎯 Goals Progress: {avgGoalProgress}% Avg
            </span>
            <div className="progress-badges-row">
              <span className="hud-badge streak">🔥 {focusStreak}d</span>
              <span className="hud-badge done">✅ {completedTasksCount}</span>
              <span className="hud-badge hours">⏱️ {totalFocusHoursLogged}h</span>
            </div>
          </div>
          <div className="productivity-progress-hud-track">
            <div 
              className="productivity-progress-hud-fill" 
              style={{ width: `${avgGoalProgress}%` }} 
            />
          </div>
        </div>

        {/* Action Controls Suite */}
        <div className="productivity-header-actions-suite">
          <Button variant="indigo" onClick={onOpenGoalModal} className="header-action-btn">
            🎯 + Goal
          </Button>

          <Button variant="emerald" onClick={onOpenTaskModal} className="header-action-btn">
            🌿 + Task
          </Button>

          <Button variant="outline" onClick={onOpenAnalytics} className="header-action-btn analytics-hud-btn">
            📊 Stats
          </Button>
        </div>

      </div>
    </div>
  );
};
