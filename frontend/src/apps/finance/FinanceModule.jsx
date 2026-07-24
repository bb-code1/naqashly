import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { DataTable } from '../../components/ui/DataTable';
import { useFinance } from '../../hooks/useFinance';
import {
  TRANSACTION_CATEGORIES,
  DEBT_PURPOSE_CATEGORIES,
  TRANSACTION_TYPES
} from '../../constants/financeConstants';
import './FinanceModule.css';

/**
 * Bank-Grade Double-Entry Interpersonal Ledger Suite.
 * Immutable Events, Bank Running Balance Statements, and Zero Mutability Overhead.
 * Fully theme-aware supporting Obsidian Dark, Luxe Light, Cyberpunk, and Forest themes!
 * 
 * @author Barkat Bashir
 * @version 24.0.0
 */
export const FinanceModule = () => {
  const {
    wallets,
    transactions,
    contactStatements,
    loading,
    netCreditSum,
    netDebitSum,
    totalWalletBalance,
    addDebt,
    addWallet,
    addTransaction
  } = useFinance();

  const [activeTab, setActiveTab] = useState('overview');

  // Modal Visibility
  const [isTxModalOpen, setIsTxModalOpen] = useState(false);
  const [isDebtModalOpen, setIsDebtModalOpen] = useState(false);
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);
  const [selectedPersonId, setSelectedPersonId] = useState(null);

  // Row Inspection Modal
  const [inspectedRecord, setInspectedRecord] = useState(null);
  const [inspectedType, setInspectedType] = useState(null); // 'DEBT' | 'TRANSACTION'

  // Form Inputs
  const [personName, setPersonName] = useState('');
  const [debtAmount, setDebtAmount] = useState('');
  const [debtType, setDebtType] = useState('GIVE_LOAN');
  const [dueDate, setDueDate] = useState('');
  const [debtCategory, setDebtCategory] = useState('SHARED_EXPENSE');
  const [debtNotes, setDebtNotes] = useState('');

  const [walletName, setWalletName] = useState('');
  const [initialBalance, setInitialBalance] = useState('');

  const [txAmount, setTxAmount] = useState('');
  const [txType, setTxType] = useState('EXPENSE');
  const [category, setCategory] = useState('FOOD');
  const [noteContent, setNoteContent] = useState('');

  // Active Person Statement Selection
  const activeContactStatement = contactStatements.find(cs => cs.person.id === selectedPersonId) || null;

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

  // Transaction Cell Renderers
  const transactionRenderers = {
    description: (val) => <span style={{ fontWeight: '500' }}>{val || 'General Log'}</span>,
    category: (val) => <span style={{ color: 'var(--text-muted)' }}>{val}</span>,
    amount: (val, row) => (
      <span style={{ fontFamily: 'var(--font-mono)', fontWeight: '700', color: row.transactionType === 'INCOME' ? 'var(--accent-emerald)' : 'var(--accent-danger)' }}>
        {row.transactionType === 'INCOME' ? '+' : '-'}${Number(val).toFixed(2)}
      </span>
    ),
    transactionType: (val) => <Badge variant={val === 'INCOME' ? 'emerald' : 'amber'}>{val}</Badge>
  };

  // Bank Statement Cell Renderers (With Running Balance)
  const statementRenderers = {
    debtType: (val) => {
      let label = '🟢 Loan Given (+)';
      let color = 'var(--accent-emerald)';

      if (val === 'TAKE_LOAN' || val === 'DEBIT') {
        label = '🔴 Loan Borrowed (-)';
        color = 'var(--accent-danger)';
      } else if (val === 'RECEIVE_PAYMENT') {
        label = '💵 Payment Received (-)';
        color = 'var(--accent-amber)';
      } else if (val === 'MAKE_PAYMENT') {
        label = '💳 Payment Made (+)';
        color = 'var(--accent-indigo)';
      }

      return <span style={{ color, fontWeight: '700', fontSize: '0.85rem' }}>{label}</span>;
    },
    givenDate: (val) => <span style={{ color: 'var(--text-muted)', fontSize: '0.82rem', fontFamily: 'var(--font-mono)' }}>{val}</span>,
    amount: (val, row) => (
      <span style={{ fontFamily: 'var(--font-mono)', fontWeight: '700', color: row.debtType === 'GIVE_LOAN' || row.debtType === 'MAKE_PAYMENT' || row.debtType === 'CREDIT' ? 'var(--accent-emerald)' : 'var(--accent-danger)' }}>
        {row.debtType === 'GIVE_LOAN' || row.debtType === 'MAKE_PAYMENT' || row.debtType === 'CREDIT' ? '+' : '-'}${Number(val).toFixed(2)}
      </span>
    ),
    runningBalance: (val) => (
      <span style={{ fontFamily: 'var(--font-mono)', fontWeight: '800', fontSize: '0.95rem', color: val >= 0 ? 'var(--accent-emerald)' : 'var(--accent-danger)' }}>
        {val >= 0 ? '+' : '-'}${Math.abs(val).toFixed(2)}
      </span>
    ),
    cleanNotes: (val) => <span style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>{val}</span>
  };

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
          <div style={{ fontSize: '0.75rem', color: 'var(--accent-emerald)', fontWeight: '600' }}>✓ Net Receivables</div>
        </motion.div>

        <motion.div whileHover={{ y: -3 }} className="metric-card-base metric-card-debit">
          <div className="metric-title">Money You Owe (Debit)</div>
          <div className="metric-value value-danger">-${netDebitSum.toFixed(2)}</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--accent-danger)', fontWeight: '600' }}>⚠️ Net Payables</div>
        </motion.div>

        <div className="metric-card-actions">
          <Button variant="emerald" onClick={() => setIsTxModalOpen(true)} style={{ width: '100%', padding: '0.6rem 0.85rem', fontSize: '0.82rem', justifyContent: 'center' }}>
            💸 + Log Transaction
          </Button>
          <Button variant="secondary" onClick={() => { setPersonName(''); setIsDebtModalOpen(true); }} style={{ width: '100%', padding: '0.6rem 0.85rem', fontSize: '0.82rem', justifyContent: 'center' }}>
            🤝 + Ledger Entry
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
          { key: 'contacts', label: '🏦 Bank Interpersonal Ledger Statements' },
          { key: 'transactions', label: '📑 Income & Expenses' },
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
                <div key={t.id} className="overview-item-row" onClick={() => { setInspectedRecord(t); setInspectedType('TRANSACTION'); }} style={{ cursor: 'pointer' }}>
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
            <h3 className="overview-card-header">🏦 Interpersonal Contact Receivables</h3>
            {contactStatements.length === 0 ? (
              <div className="empty-state-box">
                <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🤝</div>
                No contact ledger entries found in PostgreSQL.
                <div style={{ marginTop: '0.75rem' }}>
                  <Button variant="secondary" onClick={() => setIsDebtModalOpen(true)} style={{ fontSize: '0.8rem' }}>
                    + Record Ledger Entry
                  </Button>
                </div>
              </div>
            ) : (
              contactStatements.slice(0, 5).map(cs => (
                <div key={cs.person.id} className="overview-item-row" onClick={() => { setSelectedPersonId(cs.person.id); setActiveTab('contacts'); }} style={{ cursor: 'pointer' }}>
                  <div>
                    <div style={{ fontWeight: '600', color: 'var(--text-heading)', fontSize: '0.92rem' }}>{cs.person.name}</div>
                    <div style={{ fontSize: '0.75rem', color: cs.netReceivable >= 0 ? 'var(--accent-emerald)' : 'var(--accent-danger)', fontWeight: '700', marginTop: '0.15rem' }}>
                      {cs.netReceivable >= 0 ? 'Receivable' : 'Payable'}
                    </div>
                  </div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontWeight: '800', color: cs.netReceivable >= 0 ? 'var(--accent-emerald)' : 'var(--accent-danger)' }}>
                    {cs.netReceivable >= 0 ? '+' : '-'}${Math.abs(cs.netReceivable).toFixed(2)}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* BANK INTERPERSONAL LEDGER STATEMENTS TAB */}
      {activeTab === 'contacts' && (
        <div className="finance-data-card">
          
          {!activeContactStatement ? (
            /* ALL CONTACT CARDS SELECTION VIEW */
            <div>
              <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: '700', color: 'var(--text-heading)' }}>Bank Interpersonal Ledger Accounts</h3>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Click any account card below to view their Bank Running Balance Statement.</p>
                </div>
                <Button variant="emerald" onClick={() => { setPersonName(''); setIsDebtModalOpen(true); }} style={{ fontSize: '0.82rem' }}>
                  🤝 + Record Ledger Entry
                </Button>
              </div>

              {contactStatements.length === 0 ? (
                <div className="empty-state-box">
                  <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>👥</div>
                  No contact accounts found. Record a ledger entry to auto-provision accounts!
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.25rem', width: '100%' }}>
                  {contactStatements.map(cs => (
                    <motion.div
                      key={cs.person.id}
                      whileHover={{ y: -4 }}
                      onClick={() => setSelectedPersonId(cs.person.id)}
                      style={{
                        background: 'var(--bg-surface-elevated)',
                        border: '1px solid var(--border-highlight)',
                        borderRadius: '12px',
                        padding: '1.25rem',
                        cursor: 'pointer',
                        boxShadow: 'var(--card-shadow)'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                          <div style={{ width: '38px', height: '38px', borderRadius: '50%', background: 'var(--accent-amber-glow)', color: 'var(--accent-amber)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800', fontSize: '1.1rem' }}>
                            {cs.person.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <h4 style={{ fontSize: '1rem', fontWeight: '700', color: 'var(--text-heading)', margin: 0 }}>{cs.person.name}</h4>
                            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{cs.debts.length} ledger transactions</div>
                          </div>
                        </div>
                        <Badge variant={cs.netReceivable >= 0 ? 'emerald' : 'amber'}>
                          {cs.netReceivable >= 0 ? 'Receivable' : 'Payable'}
                        </Badge>
                      </div>

                      <div className="form-grid-2" style={{ gap: '0.75rem', marginBottom: '1rem' }}>
                        <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', padding: '0.6rem 0.75rem', borderRadius: '6px' }}>
                          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Total Lent</div>
                          <div style={{ fontSize: '0.95rem', fontWeight: '700', color: 'var(--accent-emerald)', fontFamily: 'var(--font-mono)' }}>
                            ${cs.totalLent.toFixed(2)}
                          </div>
                        </div>

                        <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', padding: '0.6rem 0.75rem', borderRadius: '6px' }}>
                          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Total Borrowed</div>
                          <div style={{ fontSize: '0.95rem', fontWeight: '700', color: 'var(--accent-danger)', fontFamily: 'var(--font-mono)' }}>
                            ${cs.totalBorrowed.toFixed(2)}
                          </div>
                        </div>
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '0.75rem', borderTop: '1px solid var(--border-subtle)', fontSize: '0.8rem' }}>
                        <span style={{ color: 'var(--text-muted)' }}>Net Running Balance:</span>
                        <strong style={{ fontFamily: 'var(--font-mono)', fontSize: '1.05rem', color: cs.netReceivable >= 0 ? 'var(--accent-emerald)' : 'var(--accent-danger)' }}>
                          {cs.netReceivable >= 0 ? '+' : '-'}${Math.abs(cs.netReceivable).toFixed(2)}
                        </strong>
                      </div>

                      <div style={{ marginTop: '0.75rem', textAlign: 'right' }}>
                        <span style={{ fontSize: '0.75rem', color: 'var(--accent-amber)', fontWeight: '700' }}>Open Bank Statement →</span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            /* DEDICATED BANK RUNNING BALANCE STATEMENT VIEW */
            <div>
              {/* Back Bar & Person Title */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <Button variant="secondary" onClick={() => setSelectedPersonId(null)} style={{ fontSize: '0.8rem', padding: '0.4rem 0.75rem' }}>
                    ← Back to All Accounts
                  </Button>
                  <div>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: '800', color: 'var(--text-heading)', margin: 0 }}>
                      🏦 Bank Running Balance Statement: {activeContactStatement.person.name}
                    </h3>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.1rem' }}>
                      Double-entry immutable ledger statement with dynamic O(1) running balance calculation
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  <Button variant="emerald" onClick={() => { setPersonName(activeContactStatement.person.name); setIsDebtModalOpen(true); }} style={{ fontSize: '0.82rem' }}>
                    💸 + Record Ledger Transaction / Payment
                  </Button>
                </div>
              </div>

              {/* Bank Statement Executive Metric Summary */}
              <div className="form-grid-3" style={{ gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.25rem', marginBottom: '1.75rem' }}>
                <div style={{ background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-subtle)', borderRadius: '10px', padding: '1rem' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Total Money Lent</div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1.4rem', fontWeight: '800', color: 'var(--accent-emerald)', marginTop: '0.2rem' }}>
                    ${activeContactStatement.totalLent.toFixed(2)}
                  </div>
                </div>

                <div style={{ background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-subtle)', borderRadius: '10px', padding: '1rem' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Total Money Borrowed</div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1.4rem', fontWeight: '800', color: 'var(--accent-danger)', marginTop: '0.2rem' }}>
                    ${activeContactStatement.totalBorrowed.toFixed(2)}
                  </div>
                </div>

                <div style={{ background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-subtle)', borderRadius: '10px', padding: '1rem' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Current Running Net Balance</div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1.4rem', fontWeight: '800', color: activeContactStatement.netReceivable >= 0 ? 'var(--accent-emerald)' : 'var(--accent-danger)', marginTop: '0.2rem' }}>
                    {activeContactStatement.netReceivable >= 0 ? '+' : '-'}${Math.abs(activeContactStatement.netReceivable).toFixed(2)}
                  </div>
                </div>
              </div>

              {/* Decoupled Bank Statement DataTable */}
              <DataTable
                headers={[
                  'Transaction Event Type',
                  '📅 Date',
                  'Amount ($)',
                  '🏦 Running Net Balance ($)',
                  '📝 Notes & Context'
                ]}
                keys={[
                  'debtType',
                  'givenDate',
                  'amount',
                  'runningBalance',
                  'cleanNotes'
                ]}
                renderers={statementRenderers}
                data={activeContactStatement.debts}
                loading={loading}
                emptyMessage={`No ledger statement records found for ${activeContactStatement.person.name}.`}
                onRowClick={(row) => { setInspectedRecord(row); setInspectedType('DEBT'); }}
              />
            </div>
          )}

        </div>
      )}

      {/* TRANSACTIONS TAB */}
      {activeTab === 'transactions' && (
        <div className="finance-data-card">
          <div style={{ marginBottom: '1.5rem' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: '700', color: 'var(--text-heading)' }}>Income & Expense History</h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Click any row to inspect details or manage records.</p>
          </div>

          <DataTable
            headers={['Note & Context', 'Category', 'Amount ($)', 'Type']}
            keys={['description', 'category', 'amount', 'transactionType']}
            renderers={transactionRenderers}
            data={transactions}
            loading={loading}
            emptyMessage="No transaction history recorded yet."
            onRowClick={(row) => { setInspectedRecord(row); setInspectedType('TRANSACTION'); }}
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
                <motion.div key={w.id} whileHover={{ y: -3 }} style={{ background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-highlight)', borderRadius: '12px', padding: '1.5rem', boxShadow: 'var(--card-shadow)' }}>
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

      {/* BANK LEDGER TRANSACTION / PAYMENT RECORD MODAL */}
      <AnimatePresence>
        {isDebtModalOpen && (
          <div className="modal-overlay">
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="modal-dialog debt-modal">
              <div className="modal-header">
                <div>
                  <h3 className="modal-title">💸 Record Bank Interpersonal Transaction</h3>
                  <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>Appends an immutable double-entry ledger event to the contact statement.</p>
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
                    <input type="number" step="0.01" placeholder="1000.00" value={debtAmount} onChange={e => setDebtAmount(e.target.value)} className="form-input" style={{ fontFamily: 'var(--font-mono)' }} required />
                  </div>

                  <div>
                    <label className="form-label">Ledger Event Type</label>
                    <select value={debtType} onChange={e => setDebtType(e.target.value)} className="form-select">
                      <option value="GIVE_LOAN">🟢 Give Loan (Money Lent to person)</option>
                      <option value="TAKE_LOAN">🔴 Take Loan (Money Borrowed from person)</option>
                      <option value="RECEIVE_PAYMENT">💵 Receive Payment (Repayment in from person)</option>
                      <option value="MAKE_PAYMENT">💳 Make Payment (Repayment out to person)</option>
                    </select>
                  </div>
                </div>

                <div className="form-grid-2">
                  <div>
                    <label className="form-label">📅 Date (Optional Target Date)</label>
                    <input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} className="form-input" />
                  </div>

                  <div>
                    <label className="form-label">🏷️ Category</label>
                    <select value={debtCategory} onChange={e => setDebtCategory(e.target.value)} className="form-select">
                      {DEBT_PURPOSE_CATEGORIES.map(purpose => (
                        <option key={purpose.value} value={purpose.value}>{purpose.label}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="form-label">📝 Notes & Reference (Payment Method, Reason)</label>
                  <input type="text" placeholder="e.g., Bank Transfer via UPI / Invoice Ref #402" value={debtNotes} onChange={e => setDebtNotes(e.target.value)} className="form-input" />
                </div>

                <div className="form-actions">
                  <Button variant="secondary" onClick={() => setIsDebtModalOpen(false)}>Cancel</Button>
                  <Button type="submit" variant="emerald">Append Bank Ledger Entry →</Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* CREATE MODALS (Transaction, Wallet) */}
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
                          background: txType === type.value ? (type.value === 'EXPENSE' ? 'var(--accent-danger)' : 'var(--accent-emerald)') : 'var(--bg-surface-elevated)',
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
