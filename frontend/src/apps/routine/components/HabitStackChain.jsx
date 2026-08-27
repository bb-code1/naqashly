import React from 'react';

/**
 * 🔗 Visual Habit Stack Chain Component (Atomic Habits Method)
 * 
 * Renders stacked habits in order ("After I [Anchor Habit], I will [Target Habit]")
 * with visual glowing flow lines (➔) and momentum badges.
 * 
 * @author Barkat Bashir
 * @version 1.0.0
 */
export const HabitStackChain = ({
  chainHabits = [],
  onTapHabit,
  onStartFocus,
  onOpenPopover,
  popoverHabitId,
  QualityPopoverComponent
}) => {
  if (!chainHabits || chainHabits.length <= 1) return null;

  // Chain momentum calculation
  const completedCount = chainHabits.filter(h => h.status === 'COMPLETED').length;
  const chainPct = Math.round((completedCount / chainHabits.length) * 100);

  // Find next active habit in chain
  const nextUpIndex = chainHabits.findIndex(h => h.status !== 'COMPLETED');

  return (
    <div style={{
      background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.04) 0%, rgba(99, 102, 241, 0.04) 100%)',
      border: '1px solid var(--border-subtle)',
      borderRadius: '16px',
      padding: '1.25rem',
      marginMb: '1.25rem',
      display: 'flex',
      flexDirection: 'column',
      gap: '0.85rem',
      boxShadow: '0 8px 16px -4px rgba(0, 0, 0, 0.2)'
    }}>
      {/* Chain Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ fontSize: '0.95rem' }}>🔗</span>
          <span style={{ fontSize: '0.85rem', fontWeight: '900', color: 'var(--text-heading)' }}>
            Atomic Habit Stack Chain
          </span>
          <span style={{ fontSize: '0.72rem', background: 'rgba(99, 102, 241, 0.15)', color: '#6366F1', border: '1px solid rgba(99, 102, 241, 0.3)', padding: '0.1rem 0.45rem', borderRadius: '6px', fontWeight: '800' }}>
            {completedCount}/{chainHabits.length} Done ({chainPct}%)
          </span>
        </div>
      </div>

      {/* Stacked Chain Flow Cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
        {chainHabits.map((habit, idx) => {
          const isNextUp = idx === nextUpIndex;
          const isCompleted = habit.status === 'COMPLETED';

          return (
            <React.Fragment key={habit.id}>
              {/* Connector Arrow Line between stacked habits */}
              {idx > 0 && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', paddingLeft: '1.5rem', opacity: isCompleted ? 0.9 : 0.6 }}>
                  <div style={{ width: '2px', height: '16px', background: isCompleted ? '#10B981' : 'var(--border-subtle)' }} />
                  <span style={{ fontSize: '0.75rem', fontWeight: '800', color: isCompleted ? '#10B981' : 'var(--text-muted)' }}>
                    ⬇️ After completing "{chainHabits[idx - 1]?.title}"
                  </span>
                </div>
              )}

              {/* Habit Card */}
              <div style={{
                background: isNextUp ? 'rgba(16, 185, 129, 0.08)' : 'var(--bg-surface)',
                border: `1.5px solid ${isNextUp ? '#10B981' : isCompleted ? 'rgba(16, 185, 129, 0.3)' : 'var(--border-subtle)'}`,
                borderRadius: '12px',
                padding: '0.85rem 1rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '0.75rem',
                transition: 'all 0.2s ease',
                boxShadow: isNextUp ? '0 0 15px rgba(16, 185, 129, 0.2)' : 'none'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flex: 1 }}>
                  {/* Tap Status Button */}
                  <button
                    type="button"
                    onClick={() => onTapHabit(habit)}
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '50%',
                      border: `2px solid ${isCompleted ? '#10B981' : habit.status === 'PARTIAL' ? '#F59E0B' : 'var(--border-subtle)'}`,
                      background: isCompleted ? '#10B981' : habit.status === 'PARTIAL' ? 'rgba(245, 158, 11, 0.15)' : 'transparent',
                      color: isCompleted ? '#fff' : habit.status === 'PARTIAL' ? '#F59E0B' : 'var(--text-muted)',
                      fontWeight: '900',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    {isCompleted ? '✓' : habit.status === 'PARTIAL' ? '🌓' : '⭕'}
                  </button>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.15rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span style={{ fontSize: '0.92rem', fontWeight: '800', color: isCompleted ? 'var(--text-muted)' : 'var(--text-heading)', textDecoration: isCompleted ? 'line-through' : 'none' }}>
                        {habit.title}
                      </span>
                      {isNextUp && (
                        <span style={{ fontSize: '0.68rem', fontWeight: '900', background: '#10B981', color: '#fff', padding: '0.1rem 0.4rem', borderRadius: '4px', animation: 'pulse 2s infinite' }}>
                          ⚡ Next Up in Chain!
                        </span>
                      )}
                    </div>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: '700' }}>
                      ⏱️ {habit.targetMinutes}m • {idx === 0 ? '⚓ Anchor Habit' : `Step ${idx + 1} Stack`}
                    </span>
                  </div>
                </div>

                {/* Right Action Controls */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', position: 'relative' }}>
                  <button
                    type="button"
                    onClick={() => onStartFocus(habit)}
                    style={{
                      background: 'rgba(16, 185, 129, 0.15)',
                      color: '#10B981',
                      border: '1px solid rgba(16, 185, 129, 0.3)',
                      borderRadius: '6px',
                      padding: '0.2rem 0.5rem',
                      fontSize: '0.72rem',
                      fontWeight: '800',
                      cursor: 'pointer'
                    }}
                  >
                    ▶ Start
                  </button>

                  <button
                    type="button"
                    onClick={() => onOpenPopover(popoverHabitId === habit.id ? null : habit.id)}
                    style={{ background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-subtle)', color: 'var(--text-muted)', borderRadius: '6px', padding: '0.2rem 0.45rem', fontSize: '0.72rem', fontWeight: '800', cursor: 'pointer' }}
                  >
                    •••
                  </button>

                  {popoverHabitId === habit.id && QualityPopoverComponent && (
                    <QualityPopoverComponent habit={habit} />
                  )}
                </div>
              </div>
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};
