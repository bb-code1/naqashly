import React from 'react';
import { motion } from 'framer-motion';

/**
 * 🏦 Finance Ledger & Debt Summary Widget
 * 
 * Displays net wallet balances, running debt totals, and recent transactions.
 */
export const FinanceLedgerWidget = ({ wallets = [], transactions = [], loading = false, onNavigateMode }) => {
  const totalNetBalance = wallets.reduce((acc, w) => acc + Number(w.balance || 0), 0);

  return (
    <div style={{
      background: 'var(--bg-surface-elevated)',
      border: '1px solid var(--border-subtle)',
      borderRadius: '20px',
      padding: '1.5rem',
      display: 'flex',
      flexDirection: 'column',
      gap: '1.1rem',
      boxShadow: '0 10px 30px rgba(0,0,0,0.15)'
    }}>
      {/* Header Row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 style={{ fontSize: '1.15rem', fontWeight: '900', color: 'var(--text-heading)', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span>🏦</span> Debt & Money Ledger
        </h3>
        <button
          type="button"
          onClick={() => onNavigateMode?.('FINANCE')}
          style={{ background: 'transparent', border: 'none', color: '#38BDF8', fontSize: '0.82rem', fontWeight: '800', cursor: 'pointer' }}
        >
          Open Ledger ➔
        </button>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>Loading money ledger...</div>
      ) : (
        <>
          {/* Net Standing Metric Banner */}
          <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', padding: '1rem 1.25rem', borderRadius: '14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: '800', textTransform: 'uppercase' }}>
                Net Standing Balance
              </div>
              <div style={{ fontSize: '1.4rem', fontWeight: '900', color: '#38BDF8', fontFamily: 'var(--font-mono)', marginTop: '0.15rem' }}>
                ₹{totalNetBalance.toLocaleString()}
              </div>
            </div>
            <div style={{ fontSize: '0.75rem', background: 'rgba(56, 189, 248, 0.12)', color: '#38BDF8', border: '1px solid rgba(56, 189, 248, 0.3)', padding: '0.3rem 0.65rem', borderRadius: '8px', fontWeight: '800' }}>
              {wallets.length} Wallets Syncing
            </div>
          </div>

          {/* Recent Activity List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
            <div style={{ fontSize: '0.78rem', fontWeight: '800', color: 'var(--text-muted)' }}>Recent Ledger Activity</div>
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
                    style={{
                      background: 'var(--bg-surface)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: '10px',
                      padding: '0.7rem 0.85rem',
                      display: 'flex',
                      justify: 'space-between',
                      alignItems: 'center'
                    }}
                  >
                    <span style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--text-heading)' }}>
                      {tx.note || tx.category || 'Transaction'}
                    </span>
                    <span style={{
                      fontSize: '0.88rem',
                      fontWeight: '900',
                      fontFamily: 'var(--font-mono)',
                      color: isExpense ? '#EF4444' : '#10B981'
                    }}>
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
