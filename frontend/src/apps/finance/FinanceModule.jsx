import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { DataTable } from '../../components/ui/DataTable';
import { useFinance } from '../../hooks/useFinance';
import {
  TRANSACTION_CATEGORIES,
  DEBT_PURPOSE_CATEGORIES,
  DEBT_TYPES,
  TRANSACTION_TYPES
} from '../../constants/financeConstants';
import './FinanceModule.css';

/**
 * Enterprise Naqashly Ledger Suite.
 * Consumes reusable <DataTable /> component for clean table rendering across all tabs.
 * 
 * @author Barkat Bashir
 * @version 14.0.0
 */
export const FinanceModule = () => {
  const {
    debts,
    wallets,
    transactions,
    loading,
    netCreditSum,
    netDebitSum,
    totalWalletBalance,
    addDebt,
    addWallet,
    addTransaction,
    toggleDebt
  } = useFinance();

  const [activeTab, setActiveTab] = useState('overview');

  // Modal Visibility
  const [isTxModalOpen, setIsTxModalOpen] = useState(false);
  const [isDebtModalOpen, setIsDebtModalOpen] = useState(false);
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);

  // Form Inputs
  const [personName, setPersonName] = useState('');
  const [debtAmount, setDebtAmount] = useState('');
  const [debtType, setDebtType] = useState('CREDIT');
  const [dueDate, setDueDate] = useState('');
  const [debtCategory, setDebtCategory] = useState('SHARED_EXPENSE');
  const [debtNotes, setDebtNotes] = useState('');

  const [walletName, setWalletName] = useState('');
  const [initialBalance, setInitialBalance] = useState('');

  const [txAmount, setTxAmount] = useState('');
  const [txType, setTxType] = useState('EXPENSE');
  const [category, setCategory] = useState('FOOD');
  const [noteContent, setNoteContent] = useState('');

  // Submit Handlers
  const handleDebtSubmit = async (e) => {
    e.preventDefault();
    await addDebt({ personName, amount: debtAmount, debtType, dueDate, debtCategory, debtNotes });
    setPersonName(''); setDebtAmount(''); setDueDate(''); setDebtNotes('');
    setIsDebtModalOpen(false);
  };

  const handleWalletSubmit = async (e) => {
    e.preventDefault();
    await addWallet({ name: walletName, balance: initialBalance });
    setWalletName(''); setInitialBalance('');
    setIsWalletModalOpen(false);
  };

  const handleTxSubmit = async (e) => {
    e.preventDefault();
    await addTransaction({ amount: txAmount, txType, category, noteContent });
    setTxAmount(''); setNoteContent('');
    setIsTxModalOpen(false);
  };

  // Dynamic Column Definitions for Reusable <DataTable />
  const transactionColumns = [
    {
      header: 'Note & Context (Why, What, With Whom)',
      key: 'description',
      render: (row) => <span style={{ fontWeight: '500' }}>{row.description || 'General Log'}</span>
    },
    { header: 'Category', key: 'category', render: (row) => <span style={{ color: 'var(--text-muted)' }}>{row.category}</span> },
    {
      header: 'Amount ($)',
      key: 'amount',
      render: (row) => (
        <span style={{ fontFamily: 'var(--font-mono)', fontWeight: '700', color: row.transactionType === 'INCOME' ? 'var(--accent-emerald)' : 'var(--accent-danger)' }}>
          {row.transactionType === 'INCOME' ? '+' : '-'}${Number(row.amount).toFixed(2)}
        </span>
      )
    },
    {
      header: 'Type',
      key: 'transactionType',
      render: (row) => <Badge variant={row.transactionType === 'INCOME' ? 'emerald' : 'amber'}>{row.transactionType}</Badge>
    }
  ];

  const debtColumns = [
    {
      header: 'Contact Person',
      key: 'personName',
      render: (row) => <span style={{ fontWeight: '700', color: 'var(--text-heading)' }}>{row.personName}</span>
    },
    {
      header: 'Amount ($)',
      key: 'amount',
      render: (row) => <span style={{ fontFamily: 'var(--font-mono)', fontWeight: '700' }}>${Number(row.amount).toFixed(2)}</span>
    },
    {
      header: 'Type',
      key: 'debtType',
      render: (row) => (
        <span style={{ color: row.debtType === 'CREDIT' ? 'var(--accent-emerald)' : 'var(--accent-danger)', fontWeight: '700' }}>
          {row.debtType}
        </span>
      )
    },
    {
      header: 'Target Due Date & Context Notes',
      key: 'notes',
      render: (row) => <span style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>{row.notes || 'No context notes attached'}</span>
    },
    {
      header: 'Settlement Toggle',
      key: 'status',
      render: (row) => (
        <button
          onClick={() => toggleDebt(row.id)}
          style={{
            background: row.status === 'PAID' ? 'var(--accent-emerald-glow)' : 'rgba(255, 255, 255, 0.04)',
            border: row.status === 'PAID' ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid var(--border-subtle)',
            color: row.status === 'PAID' ? 'var(--accent-emerald)' : 'var(--text-muted)',
            padding: '0.4rem 1rem', borderRadius: '9999px', fontSize: '0.78rem', fontWeight: '600', cursor: 'pointer'
          }}
        >
          {row.status === 'PAID' ? '✅ PAID' : '⏳ PENDING'}
        </button>
      )
    }
  ];

  return (
    <div className="finance-container">
      
      {/* 1. EXECUTIVE METRIC HEADER */}
      <div className="finance-metric-grid">
        <motion.div whileHover={{ y: -3 }} className="metric-card-base metric-card-networth">
          <div className="metric-label-row">
            <span className="metric-title">Total Liquid Net Worth</span>
            <Badge variant="amber">PostgreSQL Live</Badge>
          </div>
          <div className="metric-value value-amber">${totalWalletBalance.toFixed(2)}</div>
          <div className="metric-subtitle">Across {wallets.length} active wallets</div>
        </motion.div>

        <motion.div whileHover={{ y: -3 }} className="metric-card-base metric-card-credit">
          <div className="metric-title">Money Owed To You (Credit)</div>
          <div className="metric-value value-emerald">+${netCreditSum.toFixed(2)}</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--accent-emerald)', fontWeight: '600' }}>✓ Receivables Ledger</div>
        </motion.div>

        <motion.div whileHover={{ y: -3 }} className="metric-card-base metric-card-debit">
          <div className="metric-title">Money You Owe (Debit)</div>
          <div className="metric-value value-danger">-${netDebitSum.toFixed(2)}</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--accent-danger)', fontWeight: '600' }}>⚠️ Payables Ledger</div>
        </motion.div>

        <div className="metric-card-actions">
          <Button variant="emerald" onClick={() => setIsTxModalOpen(true)} style={{ width: '100%', padding: '0.6rem 0.85rem', fontSize: '0.82rem', justifyContent: 'center' }}>
            💸 + Log Transaction
          </Button>
          <Button variant="secondary" onClick={() => setIsDebtModalOpen(true)} style={{ width: '100%', padding: '0.6rem 0.85rem', fontSize: '0.82rem', justifyContent: 'center' }}>
            🤝 + Debt Record
          </Button>
          <Button variant="outline" onClick={() => setIsWalletModalOpen(true)} style={{ width: '100%', padding: '0.6rem 0.85rem', fontSize: '0.82rem', justifyContent: 'center', border: '1px solid var(--border-subtle)' }}>
            💳 + Add Wallet
          </Button>
        </div>
      </div>

      {/* 2. SUB-TABS BAR */}
      <div className="finance-subtab-bar">
        {[
          { key: 'overview', label: '📊 Overview' },
          { key: 'transactions', label: '📑 Income & Expenses' },
          { key: 'debts', label: '🤝 Debt Settlement (/debts)' },
          { key: 'wallets', label: '💳 Multi-Wallet Hub' }
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`subtab-btn ${activeTab === tab.key ? 'active' : ''}`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* 3. SUB-TAB CONTENTS */}

      {/* OVERVIEW TAB */}
      {activeTab === 'overview' && (
        <div className="overview-grid">
          <div className="finance-data-card">
            <h3 className="overview-card-header">📑 Recent Income & Expense Logs</h3>
            {transactions.length === 0 ? (
              <div className="empty-state-box">
                <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>☕</div>
                No live transactions logged yet in PostgreSQL.
                <div style={{ marginTop: '0.75rem' }}>
                  <Button variant="emerald" onClick={() => setIsTxModalOpen(true)} style={{ fontSize: '0.8rem' }}>
                    + Log First Transaction
                  </Button>
                </div>
              </div>
            ) : (
              transactions.slice(0, 5).map(t => (
                <div key={t.id} className="overview-item-row">
                  <div>
                    <div style={{ fontWeight: '600', color: 'var(--text-heading)', fontSize: '0.92rem' }}>{t.description || t.category}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>{t.category}</div>
                  </div>
                  <div className={`metric-value ${t.transactionType === 'INCOME' ? 'value-emerald' : 'value-danger'}`} style={{ fontSize: '1rem', margin: 0 }}>
                    {t.transactionType === 'INCOME' ? '+' : '-'}${Number(t.amount).toFixed(2)}
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="finance-data-card">
            <h3 className="overview-card-header">🤝 Interpersonal Debt Status</h3>
            {debts.length === 0 ? (
              <div className="empty-state-box">
                <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🤝</div>
                No debt records found in PostgreSQL.
                <div style={{ marginTop: '0.75rem' }}>
                  <Button variant="secondary" onClick={() => setIsDebtModalOpen(true)} style={{ fontSize: '0.8rem' }}>
                    + Add Debt Record
                  </Button>
                </div>
              </div>
            ) : (
              debts.slice(0, 5).map(d => (
                <div key={d.id} className="overview-item-row">
                  <div>
                    <div style={{ fontWeight: '600', color: 'var(--text-heading)', fontSize: '0.92rem' }}>{d.personName}</div>
                    <div style={{ fontSize: '0.75rem', color: d.debtType === 'CREDIT' ? 'var(--accent-emerald)' : 'var(--accent-danger)', fontWeight: '700', marginTop: '0.15rem' }}>
                      {d.debtType} (${Number(d.amount).toFixed(2)})
                    </div>
                  </div>
                  <Button variant="outline" onClick={() => toggleDebt(d.id)} style={{ fontSize: '0.78rem', padding: '0.35rem 0.85rem' }}>
                    {d.status === 'PAID' ? '✅ PAID' : '⏳ PENDING'}
                  </Button>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* TRANSACTIONS TAB */}
      {activeTab === 'transactions' && (
        <div className="finance-data-card">
          <div style={{ marginBottom: '1.5rem' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: '700', color: 'var(--text-heading)' }}>Income & Expense History</h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>All financial transactions saved in PostgreSQL naqashly_finance_db.</p>
          </div>

          <DataTable
            columns={transactionColumns}
            data={transactions}
            loading={loading}
            emptyMessage="No transaction history recorded yet."
          />
        </div>
      )}

      {/* DEBTS TAB */}
      {activeTab === 'debts' && (
        <div className="finance-data-card">
          <div style={{ marginBottom: '1.5rem' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: '700', color: 'var(--text-heading)' }}>Interpersonal Debt Ledger (/debts)</h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Track credit (lent) vs debit (borrowed) and toggle settlement status.</p>
          </div>

          <DataTable
            columns={debtColumns}
            data={debts}
            loading={loading}
            emptyMessage="No interpersonal debt records found."
          />
        </div>
      )}

      {/* WALLETS TAB */}
      {activeTab === 'wallets' && (
        <div className="finance-data-card">
          <div style={{ marginBottom: '1.5rem' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: '700', color: 'var(--text-heading)' }}>Financial Accounts & Wallets</h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Manage bank accounts, cash wallets, and crypto vaults.</p>
          </div>

          {loading ? (
            <div style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>Fetching wallet accounts from database...</div>
          ) : wallets.length === 0 ? (
            <div className="empty-state-box">
              <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>💳</div>
              No wallet accounts found in PostgreSQL.
              <div style={{ marginTop: '0.75rem' }}>
                <Button variant="secondary" onClick={() => setIsWalletModalOpen(true)} style={{ fontSize: '0.8rem' }}>
                  + Create First Wallet
                </Button>
              </div>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.25rem', width: '100%' }}>
              {wallets.map(w => (
                <motion.div key={w.id} whileHover={{ y: -3 }} style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border-highlight)', borderRadius: '12px', padding: '1.5rem' }}>
                  <div className="metric-title" style={{ marginBottom: '0.25rem' }}>Account Wallet</div>
                  <h4 style={{ fontSize: '1.1rem', fontWeight: '700', color: 'var(--text-heading)', marginBottom: '0.75rem' }}>{w.name}</h4>
                  <div className="metric-value value-amber" style={{ fontSize: '1.75rem', margin: 0 }}>
                    ${Number(w.balance).toFixed(2)}
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* MODAL DIALOG OVERLAYS */}

      {/* TRANSACTION MODAL */}
      <AnimatePresence>
        {isTxModalOpen && (
          <div className="modal-overlay">
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="modal-dialog tx-modal">
              <div className="modal-header">
                <div>
                  <h3 className="modal-title">💸 Record Financial Transaction</h3>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>Saves directly to PostgreSQL naqashly_finance_db</p>
                </div>
                <button onClick={() => setIsTxModalOpen(false)} className="modal-close-btn">✕</button>
              </div>

              <form onSubmit={handleTxSubmit} className="modal-form">
                <div>
                  <label className="form-label">Type</label>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    {TRANSACTION_TYPES.map(type => (
                      <button
                        key={type.value}
                        type="button"
                        onClick={() => setTxType(type.value)}
                        style={{
                          flex: 1, padding: '0.65rem', borderRadius: '8px', border: 'none',
                          background: txType === type.value ? (type.value === 'EXPENSE' ? 'var(--accent-danger)' : 'var(--accent-emerald)') : 'rgba(255,255,255,0.05)',
                          color: '#FFF', fontWeight: '700', fontSize: '0.85rem', cursor: 'pointer'
                        }}
                      >
                        {type.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="form-grid-2">
                  <div>
                    <label className="form-label">Amount ($)</label>
                    <input type="number" step="0.01" placeholder="0.00" value={txAmount} onChange={e => setTxAmount(e.target.value)} className="form-input" style={{ fontFamily: 'var(--font-mono)' }} required />
                  </div>

                  <div>
                    <label className="form-label">Category</label>
                    <select value={category} onChange={e => setCategory(e.target.value)} className="form-select">
                      {TRANSACTION_CATEGORIES.map(cat => (
                        <option key={cat.value} value={cat.value}>{cat.label}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="form-label">📝 Note & Context (Why, What, With Whom)</label>
                  <input type="text" placeholder="e.g., Client lunch at Cafe with Tariq & Bilal" value={noteContent} onChange={e => setNoteContent(e.target.value)} className="form-input" />
                </div>

                <div className="form-actions">
                  <Button variant="secondary" onClick={() => setIsTxModalOpen(false)}>Cancel</Button>
                  <Button type="submit">Confirm & Save Entry →</Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* DEBT MODAL */}
      <AnimatePresence>
        {isDebtModalOpen && (
          <div className="modal-overlay">
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="modal-dialog debt-modal">
              <div className="modal-header">
                <div>
                  <h3 className="modal-title">🤝 Add Interpersonal Debt Record</h3>
                  <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>Tracks credit (lent) vs debit (borrowed) with target due dates & notes.</p>
                </div>
                <button onClick={() => setIsDebtModalOpen(false)} className="modal-close-btn">✕</button>
              </div>

              <form onSubmit={handleDebtSubmit} className="modal-form">
                <div>
                  <label className="form-label">Contact Person Name</label>
                  <input type="text" placeholder="Tariq Ahmad" value={personName} onChange={e => setPersonName(e.target.value)} className="form-input" required />
                </div>

                <div className="form-grid-2">
                  <div>
                    <label className="form-label">Amount ($)</label>
                    <input type="number" step="0.01" placeholder="150.00" value={debtAmount} onChange={e => setDebtAmount(e.target.value)} className="form-input" style={{ fontFamily: 'var(--font-mono)' }} required />
                  </div>

                  <div>
                    <label className="form-label">Debt Type</label>
                    <select value={debtType} onChange={e => setDebtType(e.target.value)} className="form-select">
                      {DEBT_TYPES.map(type => (
                        <option key={type.value} value={type.value}>{type.label}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="form-grid-2">
                  <div>
                    <label className="form-label">📅 Target Settlement Due Date</label>
                    <input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} className="form-input" />
                  </div>

                  <div>
                    <label className="form-label">🏷️ Purpose Category</label>
                    <select value={debtCategory} onChange={e => setDebtCategory(e.target.value)} className="form-select">
                      {DEBT_PURPOSE_CATEGORIES.map(purpose => (
                        <option key={purpose.value} value={purpose.value}>{purpose.label}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="form-label">📝 Context Notes & Reason</label>
                  <input type="text" placeholder="e.g., Dinner & Uber share for Team Outing" value={debtNotes} onChange={e => setDebtNotes(e.target.value)} className="form-input" />
                </div>

                <div className="form-actions">
                  <Button variant="secondary" onClick={() => setIsDebtModalOpen(false)}>Cancel</Button>
                  <Button type="submit">Save Debt Record →</Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* WALLET MODAL */}
      <AnimatePresence>
        {isWalletModalOpen && (
          <div className="modal-overlay">
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="modal-dialog wallet-modal">
              <div className="modal-header">
                <h3 className="modal-title">💳 Create New Wallet Account</h3>
                <button onClick={() => setIsWalletModalOpen(false)} className="modal-close-btn">✕</button>
              </div>

              <form onSubmit={handleWalletSubmit} className="modal-form">
                <div>
                  <label className="form-label">Wallet Name</label>
                  <input type="text" placeholder="e.g. Bank Account, Cash Wallet, Crypto Vault" value={walletName} onChange={e => setWalletName(e.target.value)} className="form-input" required />
                </div>

                <div>
                  <label className="form-label">Initial Balance ($)</label>
                  <input type="number" placeholder="0.00" value={initialBalance} onChange={e => setInitialBalance(e.target.value)} className="form-input" />
                </div>

                <div className="form-actions">
                  <Button variant="secondary" onClick={() => setIsWalletModalOpen(false)}>Cancel</Button>
                  <Button type="submit">Create Wallet →</Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};
