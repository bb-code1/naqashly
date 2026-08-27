import React from 'react';
import { Button } from '../../../components/ui/Button';

export const HabitAddModal = ({
  showAddModal,
  setShowAddModal,
  newTitle,
  setNewTitle,
  newCategory,
  setNewCategory,
  newWindow,
  setNewWindow,
  newTargetMins,
  setNewTargetMins,
  windowDropdownOpen,
  setWindowDropdownOpen,
  categoryDropdownOpen,
  setCategoryDropdownOpen,
  windowDropdownRef,
  categoryDropdownRef,
  onSubmitNewHabit,

  habitToEdit,
  setHabitToEdit,
  editTitle,
  setEditTitle,
  editCategory,
  setEditCategory,
  editWindow,
  setEditWindow,
  editTargetMins,
  setEditTargetMins,
  editWindowDropdownOpen,
  setEditWindowDropdownOpen,
  editCategoryDropdownOpen,
  setEditCategoryDropdownOpen,
  editWindowDropdownRef,
  editCategoryDropdownRef,
  onSubmitEditHabit
}) => {
  return (
    <>
      {/* Add Habit Modal */}
      {showAddModal && (
        <div className="modal-overlay" style={{ zIndex: 10000 }}>
          <div className="modal-dialog wallet-modal" style={{ maxWidth: '480px' }}>
            <div className="modal-header">
              <h3 className="modal-title">🌿 Create New Habit</h3>
              <button type="button" onClick={() => setShowAddModal(false)} className="modal-close-btn">✕</button>
            </div>

            <form onSubmit={onSubmitNewHabit} className="modal-form">
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
                            color: isSelected ? 'var(--accent-indigo)' : 'var(--text-heading)',
                            background: isSelected ? 'var(--accent-indigo-glow)' : 'transparent',
                            cursor: 'pointer',
                            transition: 'all 0.15s ease'
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
                            color: isSelected ? 'var(--accent-indigo)' : 'var(--text-heading)',
                            background: isSelected ? 'var(--accent-indigo-glow)' : 'transparent',
                            cursor: 'pointer',
                            transition: 'all 0.15s ease'
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

      {/* Edit Habit Modal */}
      {habitToEdit && (
        <div className="modal-overlay" style={{ zIndex: 10000 }}>
          <div className="modal-dialog wallet-modal" style={{ maxWidth: '480px' }}>
            <div className="modal-header">
              <h3 className="modal-title">✏️ Edit Habit</h3>
              <button type="button" onClick={() => setHabitToEdit(null)} className="modal-close-btn">✕</button>
            </div>

            <form onSubmit={onSubmitEditHabit} className="modal-form">
              <div>
                <label className="form-label">Habit Name</label>
                <input
                  type="text"
                  placeholder="e.g. 15-Min Solar Reflection"
                  value={editTitle}
                  onChange={e => setEditTitle(e.target.value)}
                  className="form-input"
                  required
                  autoFocus
                />
              </div>

              <div ref={editWindowDropdownRef} style={{ position: 'relative', display: 'flex', flexDirection: 'column', gap: '0.4rem', marginTop: '1rem' }}>
                <label className="form-label">Contextual Window</label>
                <button
                  type="button"
                  onClick={() => setEditWindowDropdownOpen(!editWindowDropdownOpen)}
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
                    {editWindow === 'MORNING' && '🌅 Morning Block'}
                    {editWindow === 'AFTERNOON' && '☀️ Afternoon Block'}
                    {editWindow === 'EVENING' && '🌙 Evening Block'}
                  </span>
                  <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>{editWindowDropdownOpen ? '▲' : '▼'}</span>
                </button>

                {editWindowDropdownOpen && (
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
                      const isSelected = editWindow === item.val;
                      return (
                        <div
                          key={item.val}
                          onClick={() => {
                            setEditWindow(item.val);
                            setEditWindowDropdownOpen(false);
                          }}
                          style={{
                            padding: '0.6rem 1rem',
                            fontSize: '0.8rem',
                            fontWeight: isSelected ? '800' : '600',
                            color: isSelected ? 'var(--accent-indigo)' : 'var(--text-heading)',
                            background: isSelected ? 'var(--accent-indigo-glow)' : 'transparent',
                            cursor: 'pointer',
                            transition: 'all 0.15s ease'
                          }}
                        >
                          {item.label}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              <div ref={editCategoryDropdownRef} style={{ position: 'relative', display: 'flex', flexDirection: 'column', gap: '0.4rem', marginTop: '1rem' }}>
                <label className="form-label">Category</label>
                <button
                  type="button"
                  onClick={() => setEditCategoryDropdownOpen(!editCategoryDropdownOpen)}
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
                    {editCategory === 'PRODUCTIVITY' && '🎯 Productivity'}
                    {editCategory === 'HEALTH' && '🌿 Health & Fitness'}
                    {editCategory === 'MINDFULNESS' && '🧘 Mindfulness'}
                    {editCategory === 'LEARNING' && '📖 Learning'}
                    {editCategory === 'SPIRITUAL' && '✨ Spiritual & Reflection'}
                  </span>
                  <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>{editCategoryDropdownOpen ? '▲' : '▼'}</span>
                </button>

                {editCategoryDropdownOpen && (
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
                      { val: 'LEARNING', label: '📖 Learning' },
                      { val: 'SPIRITUAL', label: '✨ Spiritual & Reflection' }
                    ].map(item => {
                      const isSelected = editCategory === item.val;
                      return (
                        <div
                          key={item.val}
                          onClick={() => {
                            setEditCategory(item.val);
                            setEditCategoryDropdownOpen(false);
                          }}
                          style={{
                            padding: '0.6rem 1rem',
                            fontSize: '0.8rem',
                            fontWeight: isSelected ? '800' : '600',
                            color: isSelected ? 'var(--accent-indigo)' : 'var(--text-heading)',
                            background: isSelected ? 'var(--accent-indigo-glow)' : 'transparent',
                            cursor: 'pointer',
                            transition: 'all 0.15s ease'
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
                  value={editTargetMins}
                  onChange={e => setEditTargetMins(e.target.value)}
                  className="form-input"
                  required
                />
              </div>

              <div className="form-actions" style={{ justifyContent: 'flex-end', marginTop: '1rem' }}>
                <Button type="button" variant="secondary" onClick={() => setHabitToEdit(null)}>Cancel</Button>
                <Button type="submit" variant="emerald">✨ Save Changes →</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};
