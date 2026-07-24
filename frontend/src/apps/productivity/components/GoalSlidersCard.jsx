import React, { useState, useMemo } from 'react';
import { Card } from '../../../components/ui/Card';
import { Badge } from '../../../components/ui/Badge';
import { Slider } from '../../../components/ui/Slider';
import { Button } from '../../../components/ui/Button';

/**
 * Decoupled Goal Progress Sliders Carousel & Grid Pager Component.
 * Supports 4 goals per page carousel, debounced progress slider sync, and custom grid layout.
 * 
 * @author Barkat Bashir
 * @version 1.0.0
 */
export const GoalSlidersCard = ({
  goals = [],
  goalsLoading = false,
  handleSliderDrag,
  isFullTab = false,
  onOpenCreateModal
}) => {
  const [goalPage, setGoalPage] = useState(1);
  const GOALS_PER_PAGE = 4;
  const totalGoalPages = Math.max(1, Math.ceil(goals.length / GOALS_PER_PAGE));

  const paginatedGoals = useMemo(() => {
    const startIdx = (goalPage - 1) * GOALS_PER_PAGE;
    return goals.slice(startIdx, startIdx + GOALS_PER_PAGE);
  }, [goals, goalPage]);

  return (
    <Card style={isFullTab ? {} : {}}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.5rem' }}>
        <div>
          <h3 style={{ fontSize: isFullTab ? '1.25rem' : '1.1rem', fontWeight: '800', color: 'var(--text-heading)', margin: 0 }}>
            🎯 {isFullTab ? 'All Goal Progress Sliders (0% - 100%)' : 'Active Goal Progress Sliders'}
          </h3>
          {isFullTab && (
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
              Drag sliders to update progress. Changes auto-save directly to PostgreSQL with 300ms debouncing.
            </p>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
          {isFullTab && onOpenCreateModal && (
            <Button variant="indigo" onClick={onOpenCreateModal}>+ Create Goal Target</Button>
          )}

          {/* Goal Carousel / Page Controls */}
          {goals.length > GOALS_PER_PAGE && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <button
                type="button"
                onClick={() => setGoalPage(p => Math.max(1, p - 1))}
                disabled={goalPage === 1}
                style={{
                  padding: '0.2rem 0.5rem',
                  borderRadius: '6px',
                  border: '1px solid var(--border-subtle)',
                  background: 'var(--bg-surface-elevated)',
                  color: 'var(--text-heading)',
                  fontSize: '0.75rem',
                  cursor: goalPage === 1 ? 'not-allowed' : 'pointer',
                  opacity: goalPage === 1 ? 0.4 : 1
                }}
              >
                ◀ Prev
              </button>

              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: '700' }}>
                {goalPage} / {totalGoalPages}
              </span>

              <button
                type="button"
                onClick={() => setGoalPage(p => Math.min(totalGoalPages, p + 1))}
                disabled={goalPage === totalGoalPages}
                style={{
                  padding: '0.2rem 0.5rem',
                  borderRadius: '6px',
                  border: '1px solid var(--border-subtle)',
                  background: 'var(--bg-surface-elevated)',
                  color: 'var(--text-heading)',
                  fontSize: '0.75rem',
                  cursor: goalPage === totalGoalPages ? 'not-allowed' : 'pointer',
                  opacity: goalPage === totalGoalPages ? 0.4 : 1
                }}
              >
                Next ▶
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Grid Content */}
      {goalsLoading ? (
        <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', padding: '1.5rem 0' }}>Loading goals from PostgreSQL...</div>
      ) : goals.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '2.5rem 0', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
          No active goals found. Click "+ Goal Target" above to start tracking!
        </div>
      ) : (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: isFullTab ? 'repeat(2, 1fr)' : '1fr', gap: '1.25rem' }}>
            {paginatedGoals.map(g => (
              <div key={g.id} className="goal-item-card">
                <div className="goal-item-header">
                  <div>
                    <strong style={{ color: 'var(--text-heading)', fontSize: '0.95rem' }}>{g.title}</strong>
                    <span style={{ fontSize: '0.75rem', color: 'var(--accent-indigo)', display: 'block', fontWeight: '600', marginTop: '0.15rem' }}>
                      {g.category} • {g.timelineLevel}
                    </span>
                  </div>
                  <Badge variant={g.progressPercentage === 100 ? 'emerald' : 'indigo'}>
                    {g.progressPercentage}% Completed
                  </Badge>
                </div>

                <Slider
                  value={g.progressPercentage}
                  onChange={(e) => handleSliderDrag(g.id, Number(e.target.value))}
                />
              </div>
            ))}
          </div>

          {/* Bottom Pagination Controls for Full Tab */}
          {isFullTab && goals.length > GOALS_PER_PAGE && (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid var(--border-subtle)' }}>
              <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                Showing <strong style={{ color: 'var(--text-heading)' }}>{(goalPage - 1) * GOALS_PER_PAGE + 1}</strong> to <strong style={{ color: 'var(--text-heading)' }}>{Math.min(goals.length, goalPage * GOALS_PER_PAGE)}</strong> of <strong style={{ color: 'var(--text-heading)' }}>{goals.length}</strong> goal targets
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <button
                  type="button"
                  onClick={() => setGoalPage(p => Math.max(1, p - 1))}
                  disabled={goalPage === 1}
                  style={{
                    padding: '0.35rem 0.75rem',
                    borderRadius: '6px',
                    border: '1px solid var(--border-subtle)',
                    background: 'var(--bg-surface-elevated)',
                    color: 'var(--text-heading)',
                    fontSize: '0.8rem',
                    cursor: goalPage === 1 ? 'not-allowed' : 'pointer',
                    opacity: goalPage === 1 ? 0.4 : 1
                  }}
                >
                  ← Prev
                </button>

                {Array.from({ length: totalGoalPages }, (_, i) => i + 1).map(page => (
                  <button
                    key={page}
                    type="button"
                    onClick={() => setGoalPage(page)}
                    style={{
                      minWidth: '32px',
                      height: '32px',
                      borderRadius: '6px',
                      border: page === goalPage ? '1px solid var(--accent-indigo)' : '1px solid var(--border-subtle)',
                      background: page === goalPage ? 'var(--accent-indigo)' : 'var(--bg-surface-elevated)',
                      color: page === goalPage ? '#FFF' : 'var(--text-heading)',
                      fontSize: '0.8rem',
                      fontWeight: page === goalPage ? '700' : '500',
                      cursor: 'pointer'
                    }}
                  >
                    {page}
                  </button>
                ))}

                <button
                  type="button"
                  onClick={() => setGoalPage(p => Math.min(totalGoalPages, p + 1))}
                  disabled={goalPage === totalGoalPages}
                  style={{
                    padding: '0.35rem 0.75rem',
                    borderRadius: '6px',
                    border: '1px solid var(--border-subtle)',
                    background: 'var(--bg-surface-elevated)',
                    color: 'var(--text-heading)',
                    fontSize: '0.8rem',
                    cursor: goalPage === totalGoalPages ? 'not-allowed' : 'pointer',
                    opacity: goalPage === totalGoalPages ? 0.4 : 1
                  }}
                >
                  Next →
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </Card>
  );
};
