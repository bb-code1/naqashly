import React from 'react';
import { Card } from '../../../components/ui/Card';
import { Badge } from '../../../components/ui/Badge';
import { Slider } from '../../../components/ui/Slider';
import { Button } from '../../../components/ui/Button';

/**
 * Decoupled Goal Progress Sliders Grid Component (Decluttered).
 * Displays all goals in a clean, scrollable auto-fit layout.
 */
export const GoalSlidersCard = ({
  goals = [],
  goalsLoading = false,
  handleSliderDrag,
  isFullTab = false,
  onOpenCreateModal
}) => {
  return (
    <Card>
      {/* Header */}
      <div className="goals-card-header">
        <div>
          <h3 className="goals-card-title">
            🎯 {isFullTab ? 'All Goal Progress Sliders (0% - 100%)' : 'Active Goal Progress Sliders'}
          </h3>
          {isFullTab && (
            <p className="goals-card-subtitle">
              Drag sliders to update progress. Changes auto-save directly to PostgreSQL with 300ms debouncing.
            </p>
          )}
        </div>

        <div>
          {isFullTab && onOpenCreateModal && (
            <Button variant="indigo" onClick={onOpenCreateModal}>+ Create Goal Target</Button>
          )}
        </div>
      </div>

      {/* Grid Content */}
      {goalsLoading ? (
        <div className="goals-loading-label">Loading goals from PostgreSQL...</div>
      ) : goals.length === 0 ? (
        <div className="goals-empty-label">
          No active goals found. Click "+ Goal Target" above to start tracking!
        </div>
      ) : (
        <div className="goals-workspace-grid">
          {goals.map(g => (
            <div key={g.id} className="goal-item-card">
              <div className="goal-item-header">
                <div>
                  <strong className="goal-item-title">{g.title}</strong>
                  <span className="goal-item-meta">
                    {g.category} • {g.timelineLevel}
                  </span>
                </div>
                <Badge variant={g.progressPercentage === 100 ? 'emerald' : 'indigo'}>
                  {g.progressPercentage}%
                </Badge>
              </div>

              <Slider
                value={g.progressPercentage}
                onChange={(e) => handleSliderDrag(g.id, Number(e.target.value))}
              />
            </div>
          ))}
        </div>
      )}
    </Card>
  );
};
