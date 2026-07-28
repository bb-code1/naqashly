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
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      
      {/* TOP COCKPIT BAR: QUICK LOG, BUDGET RADIAL, SAVINGS RADIAL */}
      <div className="overview-cockpit-bar">
        
        {/* Quick Log Box */}
        <form onSubmit={handleTxSubmit} className="quick-log-card" style={{ gap: '0.75rem', padding: '1.25rem', display: 'flex', flexDirection: 'column', height: '100%', boxSizing: 'border-box' }}>
          <h4 style={{ fontSize: '0.92rem', fontWeight: '900', color: 'var(--text-heading)', margin: 0, display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            ⚡ Quick Log Entry
          </h4>
          
          <div style={{ display: 'flex', gap: '0.35rem' }}>
            <button
              type="button"
              onClick={() => setTxType('EXPENSE')}
              style={{ flex: 1, padding: '0.35rem', borderRadius: '6px', fontSize: '0.74rem', fontWeight: '800', cursor: 'pointer', border: txType === 'EXPENSE' ? 'none' : '1px solid var(--border-subtle)', background: txType === 'EXPENSE' ? 'var(--accent-danger)' : 'transparent', color: txType === 'EXPENSE' ? '#fff' : 'var(--text-muted)' }}
            >
              Expense
            </button>
            <button
              type="button"
              onClick={() => setTxType('INCOME')}
              style={{ flex: 1, padding: '0.35rem', borderRadius: '6px', fontSize: '0.74rem', fontWeight: '800', cursor: 'pointer', border: txType === 'INCOME' ? 'none' : '1px solid var(--border-subtle)', background: txType === 'INCOME' ? 'var(--accent-emerald)' : 'transparent', color: txType === 'INCOME' ? '#fff' : 'var(--text-muted)' }}
            >
              Income
            </button>
          </div>

          <div style={{ display: 'flex', gap: '0.45rem' }}>
            <input
              type="number"
              step="0.01"
              placeholder="₹ Amount"
              value={txAmount}
              onChange={e => setTxAmount(e.target.value)}
              style={{ flex: 1, padding: '0.45rem', borderRadius: '8px', border: '1px solid var(--border-subtle)', background: 'var(--bg-surface)', color: 'var(--text-heading)', fontSize: '0.8rem', fontFamily: 'var(--font-mono)' }}
              required
            />

            <select
              value={category}
              onChange={e => setCategory(e.target.value)}
              style={{ flex: 1, padding: '0.45rem', borderRadius: '8px', border: '1px solid var(--border-subtle)', background: 'var(--bg-surface)', color: 'var(--text-heading)', fontSize: '0.8rem' }}
            >
              {categories.map(cat => (
                <option key={cat.id} value={cat.name}>{cat.icon} {cat.name}</option>
              ))}
            </select>
          </div>

          <div style={{ display: 'flex', gap: '0.45rem' }}>
            <input
              type="text"
              placeholder="Note & Context"
              value={noteContent}
              onChange={e => setNoteContent(e.target.value)}
              style={{ flex: 1, padding: '0.45rem', borderRadius: '8px', border: '1px solid var(--border-subtle)', background: 'var(--bg-surface)', color: 'var(--text-heading)', fontSize: '0.8rem' }}
            />
            <Button type="submit" variant="emerald" style={{ fontSize: '0.8rem', padding: '0.45rem 0.85rem' }}>
              + Log
            </Button>
          </div>
        </form>

        {/* Circular Budget Utilization Gauge */}
        <div className="finance-data-card" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', height: '100%', boxSizing: 'border-box' }}>
          <h4 style={{ fontSize: '0.8rem', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '0.65rem' }}>
            Monthly Budget
          </h4>
          <div style={{ position: 'relative', width: '80px', height: '80px' }}>
            <svg width="80" height="80" viewBox="0 0 80 80">
              <circle cx="40" cy="40" r="32" fill="none" stroke="var(--border-subtle)" strokeWidth="6" />
              <circle
                cx="40"
                cy="40"
                r="32"
                fill="none"
                stroke={totalOutflow > totalOverallBudget ? '#EF4444' : totalOutflow > totalOverallBudget * 0.75 ? '#F59E0B' : '#10B981'}
                strokeWidth="6"
                strokeDasharray="201"
                strokeDashoffset={201 - (201 * Math.min(100, totalOverallBudget > 0 ? (totalOutflow / totalOverallBudget) * 100 : 0)) / 100}
                strokeLinecap="round"
                transform="rotate(-90 40 40)"
                style={{ transition: 'stroke-dashoffset 0.8s ease' }}
              />
            </svg>
            <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
              <span style={{ fontSize: '0.95rem', fontWeight: '900', color: 'var(--text-heading)', fontFamily: 'var(--font-mono)' }}>
                {totalOverallBudget > 0 ? ((totalOutflow / totalOverallBudget) * 100).toFixed(0) : 0}%
              </span>
            </div>
          </div>
          <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', marginTop: '0.5rem', fontWeight: '700' }}>
            ₹{totalOutflow.toFixed(0)} of ₹{totalOverallBudget.toFixed(0)}
          </span>
        </div>

        {/* Savings Rate Circle Gauge */}
        <div className="finance-data-card" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', height: '100%', boxSizing: 'border-box' }}>
          <h4 style={{ fontSize: '0.8rem', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '0.65rem' }}>
            Savings Rate
          </h4>
          <div style={{ position: 'relative', width: '80px', height: '80px' }}>
            <svg width="80" height="80" viewBox="0 0 80 80">
              <circle cx="40" cy="40" r="32" fill="none" stroke="var(--border-subtle)" strokeWidth="6" />
              <circle
                cx="40"
                cy="40"
                r="32"
                fill="none"
                stroke={savingsRate > 30 ? '#10B981' : savingsRate > 10 ? '#F59E0B' : '#EF4444'}
                strokeWidth="6"
                strokeDasharray="201"
                strokeDashoffset={201 - (201 * Math.min(100, Math.max(0, savingsRate))) / 100}
                strokeLinecap="round"
                transform="rotate(-90 40 40)"
                style={{ transition: 'stroke-dashoffset 0.8s ease' }}
              />
            </svg>
            <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
              <span style={{ fontSize: '0.95rem', fontWeight: '900', color: 'var(--text-heading)', fontFamily: 'var(--font-mono)' }}>
                {savingsRate.toFixed(0)}%
              </span>
            </div>
          </div>
          <span style={{ fontSize: '0.68rem', color: savingsRate > 30 ? 'var(--accent-emerald)' : savingsRate > 10 ? 'var(--accent-amber)' : 'var(--accent-danger)', marginTop: '0.5rem', fontWeight: '800' }}>
            {savingsRate > 30 ? 'Accumulator' : savingsRate > 10 ? 'Healthy' : 'Low Margin'}
          </span>
        </div>

      </div>

      {/* BALANCED 2-COLUMN SPLIT DASHBOARD */}
      <div className="finances-dashboard-grid" style={{ marginTop: 0 }}>
        
        {/* LEFT COLUMN: CATEGORY BUDGET ALLOCATION */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
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
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          
          <div className="finance-data-card" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <h4 style={{ fontSize: '0.92rem', fontWeight: '900', color: 'var(--text-heading)', margin: 0, display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              📊 Advanced Spending Telemetry
            </h4>

            <div>
              <span style={{ fontSize: '0.74rem', fontWeight: '800', color: 'var(--text-muted)' }}>Spend Distribution</span>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem', marginTop: '0.45rem' }}>
                {categoryBreakdown.slice(0, 3).map((item, idx) => {
                  const colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];
                  const itemColor = colors[idx % colors.length];
                  return (
                    <div key={item.category}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: 'var(--text-heading)' }}>
                        <span>{item.category}</span>
                        <span style={{ fontFamily: 'var(--font-mono)' }}>₹{item.amount.toFixed(0)} ({item.percentage.toFixed(0)}%)</span>
                      </div>
                      <div style={{ width: '100%', height: '4px', background: 'var(--bg-surface-elevated)', borderRadius: '2px', overflow: 'hidden', marginTop: '0.2rem' }}>
                        <div style={{ width: `${item.percentage}%`, height: '100%', background: itemColor }} />
                      </div>
                    </div>
                  );
                })}
                {categoryBreakdown.length === 0 && (
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>No expense data logged</span>
                )}
              </div>
            </div>

            <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: '10px', padding: '0.65rem 0.85rem', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.74rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>Daily Average Spend Rate:</span>
                <strong style={{ color: 'var(--text-heading)', fontFamily: 'var(--font-mono)' }}>₹{(totalOutflow / Math.max(1, new Date().getDate())).toFixed(0)}/day</strong>
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
                    <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '0.45rem', marginTop: '0.2rem', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                      {alerts.slice(0, 2).map(a => (
                        <div key={a.category} style={{ fontSize: '0.68rem', color: 'var(--accent-danger)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                          <span>⚠️ {a.icon} <strong>{a.category}</strong> limit will exhaust in ~{a.remainingDays.toFixed(0)} days at current velocity!</span>
                        </div>
                      ))}
                    </div>
                  );
                }
                return (
                  <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '0.45rem', marginTop: '0.2rem', fontSize: '0.68rem', color: 'var(--accent-emerald)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    <span>✓ All category spending velocities are healthy and sustainable.</span>
                  </div>
                );
              })()}
            </div>
          </div>

          {/* Recent transaction rows */}
          <div className="finance-data-card" style={{ padding: '1.25rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.85rem' }}>
              <h4 style={{ fontSize: '0.92rem', fontWeight: '900', color: 'var(--text-heading)', margin: 0 }}>
                📑 Recent Activity Log
              </h4>
              <button type="button" onClick={() => setActiveTab('transactions')} style={{ background: 'none', border: 'none', color: '#38BDF8', fontSize: '0.74rem', fontWeight: '800', cursor: 'pointer' }}>
                View All ➔
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
              {transactions.slice(0, 3).map(t => (
                <div key={t.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: '10px', padding: '0.65rem 0.85rem' }}>
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span style={{ fontSize: '0.82rem', fontWeight: '800', color: 'var(--text-heading)' }}>{t.description || t.category}</span>
                    <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', marginTop: '0.1rem' }}>{t.category}</span>
                  </div>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.88rem', fontWeight: '900', color: t.transactionType === 'INCOME' ? 'var(--accent-emerald)' : 'var(--accent-danger)' }}>
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
