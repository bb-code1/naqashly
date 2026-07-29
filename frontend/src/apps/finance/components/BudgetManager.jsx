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
    <div className="finance-data-card budget-manager-card">
      <div className="budget-manager-header">
        <div>
          <h4 className="budget-manager-title">
            🎯 Monthly Category Budgets
          </h4>
          <p className="budget-manager-subtitle">
            Spending limits and active budget allocations
          </p>
        </div>
        <Button variant="emerald" type="button" onClick={() => setIsCategoryModalOpen(true)} className="budget-manager-add-btn">
          + Add Category
        </Button>
      </div>

      <div className="budget-list-container">
        {budgetHealthList.map((item) => {
          const isEditingThis = editingCatId === item.id;
          let barColor = item.color || '#3B82F6';
          if (item.isOver) barColor = '#EF4444';
          else if (item.isNear) barColor = '#F59E0B';

          return (
            <div
              key={item.id}
              className={`budget-item-card ${item.isOver ? 'over' : ''} ${item.isNear ? 'near' : ''}`}
            >
              <div className="budget-item-row">
                <div className="budget-item-meta">
                  <span className="budget-item-icon">{item.icon}</span>
                  <span className="budget-item-name">
                    {item.category}
                  </span>
                  <span className="budget-item-limits">
                    (₹{item.spent.toFixed(0)} / ₹{item.limit.toFixed(0)})
                  </span>
                </div>

                <div className="budget-item-actions">
                  {isEditingThis ? (
                    <div className="budget-edit-form">
                      <input
                        type="number"
                        value={newBudgetVal}
                        onChange={e => setNewBudgetVal(e.target.value)}
                        className="budget-edit-input"
                      />
                      <button onClick={() => handleSaveBudgetLimit(item.id)} className="budget-edit-save-btn">
                        Save
                      </button>
                    </div>
                  ) : (
                    <button onClick={() => { setEditingCatId(item.id); setNewBudgetVal(item.limit); }} className="budget-action-btn-text">
                      ✏️ Limit
                    </button>
                  )}
                  <button onClick={() => deleteCategory(item.id)} className="budget-action-btn-text delete">
                    ✕
                  </button>
                </div>
              </div>

              {/* Visual budget fill bar */}
              <div className="budget-progress-bar-wrap">
                <div className="budget-progress-bar-fill" style={{ width: `${Math.min(100, item.percentage)}%`, background: barColor }} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
