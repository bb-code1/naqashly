import React from 'react';
import { Button } from '../../../components/ui/Button';
import { GOAL_CATEGORIES, TIMELINE_LEVELS, TASK_PRIORITIES } from '../../../constants/productivityConstants';

/**
 * Goal & Task Creation Modal Dialogs Component for Productivity Suite.
 * Rendered dynamically when showGoalModal or showTaskModal is active.
 * 
 * @author Barkat Bashir
 * @version 1.0.0
 */
export const ProductivityModals = ({
  showGoalModal,
  setShowGoalModal,
  goalSubmitting,
  editingGoal,
  goalTitle,
  setGoalTitle,
  goalCategory,
  setGoalCategory,
  goalTimelineLevel,
  setGoalTimelineLevel,
  goalTargetDate,
  setGoalTargetDate,
  onSaveGoal,

  showTaskModal,
  setShowTaskModal,
  taskSubmitting,
  taskTitle,
  setTaskTitle,
  taskPriority,
  setTaskPriority,
  taskCategory,
  setTaskCategory,
  taskGoalId,
  setTaskGoalId,
  taskDueDate,
  setTaskDueDate,
  onSaveTask,
  goals = []
}) => {
  return (
    <>
      {/* 1. CREATE/EDIT GOAL TARGET MODAL */}
      {showGoalModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.6)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 9999,
          padding: '1rem'
        }}>
          <div style={{
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-subtle)',
            borderRadius: '16px',
            width: '100%',
            maxWidth: '520px',
            padding: '1.75rem',
            boxShadow: '0 20px 40px rgba(0,0,0,0.3)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: '800', color: 'var(--text-heading)', margin: 0 }}>
                {editingGoal ? '✏️ Edit Goal Target' : '🎯 Create Goal Target'}
              </h3>
              <button
                type="button"
                onClick={() => setShowGoalModal(false)}
                style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', fontSize: '1.2rem', cursor: 'pointer' }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={onSaveGoal}>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: 'var(--text-heading)', marginBottom: '0.35rem' }}>
                  Goal Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Expand Revenue to $50k/mo"
                  value={goalTitle}
                  onChange={(e) => setGoalTitle(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.6rem 0.85rem',
                    borderRadius: '8px',
                    border: '1px solid var(--border-subtle)',
                    background: 'var(--bg-surface-elevated)',
                    color: 'var(--text-heading)',
                    fontSize: '0.85rem',
                    outline: 'none'
                  }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: 'var(--text-heading)', marginBottom: '0.35rem' }}>
                    Category
                  </label>
                  <select
                    value={goalCategory}
                    onChange={(e) => setGoalCategory(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.6rem 0.85rem',
                      borderRadius: '8px',
                      border: '1px solid var(--border-subtle)',
                      background: 'var(--bg-surface-elevated)',
                      color: 'var(--text-heading)',
                      fontSize: '0.85rem',
                      outline: 'none'
                    }}
                  >
                    {GOAL_CATEGORIES.map(c => (
                      <option key={c.value} value={c.value}>{c.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: 'var(--text-heading)', marginBottom: '0.35rem' }}>
                    Timeline Level
                  </label>
                  <select
                    value={goalTimelineLevel}
                    onChange={(e) => setGoalTimelineLevel(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.6rem 0.85rem',
                      borderRadius: '8px',
                      border: '1px solid var(--border-subtle)',
                      background: 'var(--bg-surface-elevated)',
                      color: 'var(--text-heading)',
                      fontSize: '0.85rem',
                      outline: 'none'
                    }}
                  >
                    {TIMELINE_LEVELS.map(t => (
                      <option key={t.value} value={t.value}>{t.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: 'var(--text-heading)', marginBottom: '0.35rem' }}>
                  Target Date
                </label>
                <input
                  type="date"
                  value={goalTargetDate}
                  onChange={(e) => setGoalTargetDate(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.6rem 0.85rem',
                    borderRadius: '8px',
                    border: '1px solid var(--border-subtle)',
                    background: 'var(--bg-surface-elevated)',
                    color: 'var(--text-heading)',
                    fontSize: '0.85rem',
                    outline: 'none'
                  }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                <Button type="button" variant="subtle" onClick={() => setShowGoalModal(false)}>Cancel</Button>
                <Button type="submit" variant="indigo" disabled={goalSubmitting}>
                  {goalSubmitting ? 'Saving...' : (editingGoal ? 'Save Changes' : 'Create Goal Target')}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 2. CREATE PRIORITY TASK MODAL */}
      {showTaskModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.6)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 9999,
          padding: '1rem'
        }}>
          <div style={{
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-subtle)',
            borderRadius: '16px',
            width: '100%',
            maxWidth: '520px',
            padding: '1.75rem',
            boxShadow: '0 20px 40px rgba(0,0,0,0.3)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: '800', color: 'var(--text-heading)', margin: 0 }}>
                ⚡ Create Eisenhower Priority Task
              </h3>
              <button
                type="button"
                onClick={() => setShowTaskModal(false)}
                style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', fontSize: '1.2rem', cursor: 'pointer' }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={onSaveTask}>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: 'var(--text-heading)', marginBottom: '0.35rem' }}>
                  Task Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Audit microservice security endpoint"
                  value={taskTitle}
                  onChange={(e) => setTaskTitle(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.6rem 0.85rem',
                    borderRadius: '8px',
                    border: '1px solid var(--border-subtle)',
                    background: 'var(--bg-surface-elevated)',
                    color: 'var(--text-heading)',
                    fontSize: '0.85rem',
                    outline: 'none'
                  }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: 'var(--text-heading)', marginBottom: '0.35rem' }}>
                    Priority Matrix
                  </label>
                  <select
                    value={taskPriority}
                    onChange={(e) => setTaskPriority(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.6rem 0.85rem',
                      borderRadius: '8px',
                      border: '1px solid var(--border-subtle)',
                      background: 'var(--bg-surface-elevated)',
                      color: 'var(--text-heading)',
                      fontSize: '0.85rem',
                      outline: 'none'
                    }}
                  >
                    {TASK_PRIORITIES.map(p => (
                      <option key={p.value} value={p.value}>{p.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: 'var(--text-heading)', marginBottom: '0.35rem' }}>
                    Category
                  </label>
                  <input
                    type="text"
                    placeholder="General / Engineering"
                    value={taskCategory}
                    onChange={(e) => setTaskCategory(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.6rem 0.85rem',
                      borderRadius: '8px',
                      border: '1px solid var(--border-subtle)',
                      background: 'var(--bg-surface-elevated)',
                      color: 'var(--text-heading)',
                      fontSize: '0.85rem',
                      outline: 'none'
                    }}
                  />
                </div>
              </div>

              {/* Linked Goal Dropdown Target */}
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: 'var(--text-heading)', marginBottom: '0.35rem' }}>
                  🎯 Link to Parent Goal Target (Optional Traceability)
                </label>
                <select
                  value={taskGoalId}
                  onChange={(e) => setTaskGoalId(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.6rem 0.85rem',
                    borderRadius: '8px',
                    border: '1px solid var(--border-subtle)',
                    background: 'var(--bg-surface-elevated)',
                    color: 'var(--text-heading)',
                    fontSize: '0.85rem',
                    outline: 'none'
                  }}
                >
                  <option value="">-- No Linked Goal (Standalone Task) --</option>
                  {goals.map(g => (
                    <option key={g.id} value={g.id}>🎯 {g.title} ({g.progressPercentage}%)</option>
                  ))}
                </select>
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: 'var(--text-heading)', marginBottom: '0.35rem' }}>
                  Due Date
                </label>
                <input
                  type="date"
                  value={taskDueDate}
                  onChange={(e) => setTaskDueDate(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.6rem 0.85rem',
                    borderRadius: '8px',
                    border: '1px solid var(--border-subtle)',
                    background: 'var(--bg-surface-elevated)',
                    color: 'var(--text-heading)',
                    fontSize: '0.85rem',
                    outline: 'none'
                  }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                <Button type="button" variant="subtle" onClick={() => setShowTaskModal(false)}>Cancel</Button>
                <Button type="submit" variant="indigo" disabled={taskSubmitting}>
                  {taskSubmitting ? 'Creating...' : 'Create Task'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};
