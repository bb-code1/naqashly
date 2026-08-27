import React from 'react';
import { motion } from 'framer-motion';

/**
 * 🏦 Finance Ledger & Debt Summary Widget
 * 
 * Displays net wallet balances, running debt totals, and recent transactions.
 */
export const FinanceLedgerWidget = ({ wallets = [], transactions = [], loading = false, onNavigateMode }) => {
  const totalInflow = transactions.filter(t => t.transactionType === 'INCOME').reduce((acc, curr) => acc + parseFloat(curr.amount || 0), 0);
  const totalOutflow = transactions.filter(t => t.transactionType === 'EXPENSE').reduce((acc, curr) => acc + parseFloat(curr.amount || 0), 0);
  const netCashBalance = totalInflow - totalOutflow;

  return (
    <div className="dashboard-card widget-finance">
      {/* Header Row */}
      <div className="dashboard-card-header">
        <h3 className="dashboard-card-title">
          <span>💰</span> Personal Finances
        </h3>
        <button
          type="button"
          onClick={() => onNavigateMode?.('FINANCE')}
          className="dashboard-card-link"
          style={{ color: '#38BDF8' }}
        >
          Open Finances ➔
        </button>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>Loading finances...</div>
      ) : (
        <>
          {/* Net Standing Metric Banner */}
          <div className="dashboard-ledger-banner">
            <div>
              <div className="dashboard-ledger-title">
                Net Cash Balance
              </div>
              <div className="dashboard-ledger-value">
                ₹{netCashBalance.toLocaleString()}
              </div>
            </div>
            <div className="dashboard-ledger-badge">
              Live Ledger Status
            </div>
          </div>

          {/* Recent Activity List */}
          <div className="dashboard-card-body">
            <div className="dashboard-card-item-badge">Recent Activity</div>
            {transactions.length === 0 ? (
              <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', textAlign: 'center', padding: '1rem' }}>
                No recent transactions.
              </div>
            ) : (
              transactions.slice(0, 3).map(tx => {
                const isExpense = tx.type === 'EXPENSE' || tx.type === 'LOAN_GIVEN';
                return (
                  <motion.div
                    key={tx.id}
                    whileHover={{ scale: 1.01 }}
                    className="dashboard-card-item-static"
                  >
                    <span className="dashboard-card-item-title">
                      {tx.note || tx.category || 'Transaction'}
                    </span>
                    <span
                      style={{
                        fontFamily: 'var(--font-mono)',
                        color: isExpense ? '#EF4444' : '#10B981',
                        fontWeight: '900',
                        fontSize: '0.88rem'
                      }}
                    >
                      {isExpense ? '-' : '+'}₹{Number(tx.amount || 0).toLocaleString()}
                    </span>
                  </motion.div>
                );
              })
            )}
          </div>
        </>
      )}
    </div>
  );
};
