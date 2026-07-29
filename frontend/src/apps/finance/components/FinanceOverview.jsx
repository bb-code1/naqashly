import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';
import { BudgetManager } from './BudgetManager';

export const FinanceOverview = ({
  categories,
  transactions,
  totalOutflow,
  totalOverallBudget,
  savingsRate,
  budgetHealthList,
  categoryBreakdown,
  editingCatId,
  setEditingCatId,
  newBudgetVal,
  setNewBudgetVal,
  deleteCategory,
  handleSaveBudgetLimit,
  setIsCategoryModalOpen,
  setActiveTab,
  txAmount,
  setTxAmount,
  txType,
  setTxType,
  category,
  setCategory,
  noteContent,
  setNoteContent,
  handleTxSubmit
}) => {
  return (
    <div className="finance-overview-root">
      
      {/* TOP COCKPIT BAR: QUICK LOG, BUDGET RADIAL, SAVINGS RADIAL */}
      <div className="overview-cockpit-bar">
        
        {/* Quick Log Box */}
        <form onSubmit={handleTxSubmit} className="quick-log-card">
          <h4 className="quick-log-title">
            ⚡ Quick Log Entry
          </h4>
          
          <div className="quick-log-row flex">
            <button
              type="button"
              onClick={() => setTxType('EXPENSE')}
              className={`quick-log-type-btn expense ${txType === 'EXPENSE' ? 'active' : ''}`}
            >
              Expense
            </button>
            <button
              type="button"
              onClick={() => setTxType('INCOME')}
              className={`quick-log-type-btn income ${txType === 'INCOME' ? 'active' : ''}`}
            >
              Income
            </button>
          </div>

          <div className="quick-log-row flex-gap">
            <input
              type="number"
              step="0.01"
              placeholder="₹ Amount"
              value={txAmount}
              onChange={e => setTxAmount(e.target.value)}
              className="quick-log-input font-mono"
              required
            />

            <select
              value={category}
              onChange={e => setCategory(e.target.value)}
              className="quick-log-select"
            >
              {categories.map(cat => (
                <option key={cat.id} value={cat.name}>{cat.icon} {cat.name}</option>
              ))}
            </select>
          </div>

          <div className="quick-log-row flex-gap">
            <input
              type="text"
              placeholder="Note & Context"
              value={noteContent}
              onChange={e => setNoteContent(e.target.value)}
              className="quick-log-input"
            />
            <Button type="submit" variant="emerald" className="quick-log-submit-btn">
              + Log
            </Button>
          </div>
        </form>

        {/* Circular Budget Utilization Gauge */}
        <div className="finance-data-card circle-gauge-card">
          <h4 className="circle-gauge-title">
            Monthly Budget
          </h4>
          <div className="circle-gauge-svg-wrap">
            <svg width="80" height="80" viewBox="0 0 80 80">
              <defs>
                <linearGradient id="grad-emerald" x1="0%" y1="100%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#059669" />
                  <stop offset="100%" stopColor="#34D399" />
                </linearGradient>
                <linearGradient id="grad-amber" x1="0%" y1="100%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#D97706" />
                  <stop offset="100%" stopColor="#FBBF24" />
                </linearGradient>
                <linearGradient id="grad-danger" x1="0%" y1="100%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#DC2626" />
                  <stop offset="100%" stopColor="#F87171" />
                </linearGradient>
                <filter id="gauge-glow" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="2.5" result="blur" />
                  <feComponentTransfer in="blur" result="brightBlur">
                    <feFuncA type="linear" slope="0.4" />
                  </feComponentTransfer>
                  <feMerge>
                    <feMergeNode in="brightBlur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>
              <circle cx="40" cy="40" r="32" fill="none" stroke="var(--border-subtle)" strokeWidth="6" />
              <circle
                cx="40"
                cy="40"
                r="32"
                fill="none"
                stroke={`url(#${totalOutflow > totalOverallBudget ? 'grad-danger' : totalOutflow > totalOverallBudget * 0.75 ? 'grad-amber' : 'grad-emerald'})`}
                strokeWidth="6"
                strokeDasharray="201"
                strokeDashoffset={201 - (201 * Math.min(100, totalOverallBudget > 0 ? (totalOutflow / totalOverallBudget) * 100 : 0)) / 100}
                strokeLinecap="round"
                transform="rotate(-90 40 40)"
                filter="url(#gauge-glow)"
                className="circle-gauge-svg-fill"
              />
            </svg>
            <div className="circle-gauge-inner-label">
              <span className="circle-gauge-percentage">
                {totalOverallBudget > 0 ? ((totalOutflow / totalOverallBudget) * 100).toFixed(0) : 0}%
              </span>
            </div>
          </div>
          <span className="circle-gauge-subtitle">
            ₹{totalOutflow.toFixed(0)} of ₹{totalOverallBudget.toFixed(0)}
          </span>
        </div>

        {/* Savings Rate Circle Gauge */}
        <div className="finance-data-card circle-gauge-card">
          <h4 className="circle-gauge-title">
            Savings Rate
          </h4>
          <div className="circle-gauge-svg-wrap">
            <svg width="80" height="80" viewBox="0 0 80 80">
              <circle cx="40" cy="40" r="32" fill="none" stroke="var(--border-subtle)" strokeWidth="6" />
              <circle
                cx="40"
                cy="40"
                r="32"
                fill="none"
                stroke={`url(#${savingsRate > 30 ? 'grad-emerald' : savingsRate > 10 ? 'grad-amber' : 'grad-danger'})`}
                strokeWidth="6"
                strokeDasharray="201"
                strokeDashoffset={201 - (201 * Math.min(100, Math.max(0, savingsRate))) / 100}
                strokeLinecap="round"
                transform="rotate(-90 40 40)"
                filter="url(#gauge-glow)"
                className="circle-gauge-svg-fill"
              />
            </svg>
            <div className="circle-gauge-inner-label">
              <span className="circle-gauge-percentage">
                {savingsRate.toFixed(0)}%
              </span>
            </div>
          </div>
          <span className={`circle-gauge-status ${savingsRate > 30 ? 'high' : savingsRate > 10 ? 'med' : 'low'}`}>
            {savingsRate > 30 ? 'Accumulator' : savingsRate > 10 ? 'Healthy' : 'Low Margin'}
          </span>
        </div>

      </div>

      {/* BALANCED 2-COLUMN SPLIT DASHBOARD */}
      <div className="finances-dashboard-grid">
        
        {/* LEFT COLUMN: CATEGORY BUDGET ALLOCATION */}
        <div className="finance-overview-column">
          <BudgetManager
            budgetHealthList={budgetHealthList}
            editingCatId={editingCatId}
            setEditingCatId={setEditingCatId}
            newBudgetVal={newBudgetVal}
            setNewBudgetVal={setNewBudgetVal}
            deleteCategory={deleteCategory}
            handleSaveBudgetLimit={handleSaveBudgetLimit}
            setIsCategoryModalOpen={setIsCategoryModalOpen}
          />
        </div>

        {/* RIGHT COLUMN: DETAILED spending TELEMETRY & RECENT logs */}
        <div className="finance-overview-column">
          
          <div className="finance-data-card telemetry-card">
            <h4 className="telemetry-title">
              📊 Advanced Spending Telemetry
            </h4>

            <div>
              <span className="telemetry-subheading">Spend Distribution</span>
              <div className="telemetry-list">
                {categoryBreakdown.slice(0, 3).map((item, idx) => {
                  const colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];
                  const itemColor = colors[idx % colors.length];
                  return (
                    <div key={item.category}>
                      <div className="telemetry-item-header">
                        <span>{item.category}</span>
                        <span className="font-mono">₹{item.amount.toFixed(0)} ({item.percentage.toFixed(0)}%)</span>
                      </div>
                      <div className="telemetry-progress-bar-wrap">
                        <div className="telemetry-progress-bar-fill" style={{ width: `${item.percentage}%`, background: itemColor }} />
                      </div>
                    </div>
                  );
                })}
                {categoryBreakdown.length === 0 && (
                  <span className="telemetry-no-data">No expense data logged</span>
                )}
              </div>
            </div>

            <div className="daily-spend-rate-card">
              <div className="daily-spend-row">
                <span className="daily-spend-label">Daily Average Spend Rate:</span>
                <strong className="daily-spend-value">₹{(totalOutflow / Math.max(1, new Date().getDate())).toFixed(0)}/day</strong>
              </div>

              {/* Exhaustion warning */}
              {(() => {
                const today = new Date();
                const day = Math.max(1, today.getDate());
                const alerts = budgetHealthList
                  .map(b => {
                    const dailyVelocity = b.spent / day;
                    if (dailyVelocity <= 0) return null;
                    const remainingDays = b.remaining / dailyVelocity;
                    return { category: b.category, remainingDays, icon: b.icon };
                  })
                  .filter(a => a && a.remainingDays > 0 && a.remainingDays < 7);

                if (alerts.length > 0) {
                  return (
                    <div className="exhaustion-alerts-list">
                      {alerts.slice(0, 2).map(a => (
                        <div key={a.category} className="exhaustion-alert-item">
                          <span>⚠️ {a.icon} <strong>{a.category}</strong> limit will exhaust in ~{a.remainingDays.toFixed(0)} days at current velocity!</span>
                        </div>
                      ))}
                    </div>
                  );
                }
                return (
                  <div className="exhaustion-healthy-bar">
                    <span>✓ All category spending velocities are healthy and sustainable.</span>
                  </div>
                );
              })()}
            </div>
          </div>

          {/* Recent transaction rows */}
          <div className="finance-data-card recent-activity-card">
            <div className="recent-activity-header">
              <h4 className="recent-activity-title">
                📑 Recent Activity Log
              </h4>
              <button type="button" onClick={() => setActiveTab('transactions')} className="recent-activity-view-all-btn">
                View All ➔
              </button>
            </div>

            <div className="recent-activity-list">
              {transactions.slice(0, 3).map(t => (
                <div key={t.id} className="recent-activity-item">
                  <div className="recent-activity-meta">
                    <span className="recent-activity-name">{t.description || t.category}</span>
                    <span className="recent-activity-category">{t.category}</span>
                  </div>
                  <span className={`recent-activity-amount ${t.transactionType === 'INCOME' ? 'income' : 'expense'}`}>
                    {t.transactionType === 'INCOME' ? '+' : '-'}₹{Number(t.amount).toFixed(0)}
                  </span>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
