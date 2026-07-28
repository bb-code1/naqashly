import React from 'react';
import { Button } from '../../../components/ui/Button';

export const BudgetManager = ({
  budgetHealthList,
  editingCatId,
  setEditingCatId,
  newBudgetVal,
  setNewBudgetVal,
  deleteCategory,
  handleSaveBudgetLimit,
  setIsCategoryModalOpen
}) => {
  return (
    <div className="finance-data-card" style={{ padding: '1.25rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <div>
          <h4 style={{ fontSize: '0.95rem', fontWeight: '800', color: 'var(--text-heading)', margin: 0 }}>
            🎯 Monthly Category Budgets
          </h4>
          <p style={{ fontSize: '0.74rem', color: 'var(--text-muted)', margin: '0.1rem 0 0 0' }}>
            Spending limits and active budget allocations
          </p>
        </div>
        <Button variant="emerald" type="button" onClick={() => setIsCategoryModalOpen(true)} style={{ fontSize: '0.74rem', padding: '0.35rem 0.65rem' }}>
          + Add Category
        </Button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
        {budgetHealthList.map((item) => {
          const isEditingThis = editingCatId === item.id;
          let barColor = item.color || '#3B82F6';
          if (item.isOver) barColor = '#EF4444';
          else if (item.isNear) barColor = '#F59E0B';

          return (
            <div
              key={item.id}
              style={{
                background: 'var(--bg-surface)',
                border: item.isOver ? '1px solid rgba(239, 68, 68, 0.3)' : '1px solid var(--border-subtle)',
                borderRadius: '12px',
                padding: '0.85rem 1rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.45rem'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ fontSize: '1.15rem' }}>{item.icon}</span>
                  <span style={{ fontSize: '0.88rem', fontWeight: '800', color: 'var(--text-heading)' }}>
                    {item.category}
                  </span>
                  <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                    (₹{item.spent.toFixed(0)} / ₹{item.limit.toFixed(0)})
                  </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  {isEditingThis ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                      <input
                        type="number"
                        value={newBudgetVal}
                        onChange={e => setNewBudgetVal(e.target.value)}
                        style={{ width: '60px', padding: '0.15rem 0.35rem', borderRadius: '4px', background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-subtle)', color: 'var(--text-heading)', fontSize: '0.78rem' }}
                      />
                      <button onClick={() => handleSaveBudgetLimit(item.id)} style={{ padding: '0.15rem 0.35rem', background: '#10B981', border: 'none', color: '#FFF', borderRadius: '4px', fontSize: '0.7rem', fontWeight: '700', cursor: 'pointer' }}>
                        Save
                      </button>
                    </div>
                  ) : (
                    <button onClick={() => { setEditingCatId(item.id); setNewBudgetVal(item.limit); }} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '0.74rem', cursor: 'pointer' }}>
                      ✏️ Limit
                    </button>
                  )}
                  <button onClick={() => deleteCategory(item.id)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '0.74rem', cursor: 'pointer' }}>
                    ✕
                  </button>
                </div>
              </div>

              {/* Visual budget fill bar */}
              <div style={{ width: '100%', height: '6px', background: 'var(--bg-surface-elevated)', borderRadius: '3px', overflow: 'hidden' }}>
                <div style={{ width: `${Math.min(100, item.percentage)}%`, height: '100%', background: barColor }} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
