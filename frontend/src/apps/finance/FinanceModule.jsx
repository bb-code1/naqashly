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
 * Enterprise Power-Enabled Naqashly Ledger Suite.
 * Featuring FIFO Waterfall Payment Reconciliation & Contact Statement Ledgering.
 * 
 * @author Barkat Bashir
 * @version 22.0.0
 */
export const FinanceModule = () => {
  const {
    persons,
    debts,
    wallets,
    transactions,
    contactStatements,
    loading,
    netCreditSum,
    netDebitSum,
    totalWalletBalance,
    addDebt,
    addWallet,
    addTransaction,
    recordPersonFifoRepayment,
    toggleDebt
  } = useFinance();

  const [activeTab, setActiveTab] = useState('overview');

  // Modal Visibility
  const [isTxModalOpen, setIsTxModalOpen] = useState(false);
  const [isDebtModalOpen, setIsDebtModalOpen] = useState(false);
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);
  const [isPersonPayModalOpen, setIsPersonPayModalOpen] = useState(false);
  const [selectedPersonId, setSelectedPersonId] = useState(null);

  // Row Inspection Modal
  const [inspectedRecord, setInspectedRecord] = useState(null);
  const [inspectedType, setInspectedType] = useState(null); // 'DEBT' | 'TRANSACTION'
  const [repayAmountInput, setRepayAmountInput] = useState('');

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

  const handlePersonPaySubmit = async (e) => {
    e.preventDefault();
    if (!activeContactStatement || !repayAmountInput) return;
    await recordPersonFifoRepayment(activeContactStatement.person.name, repayAmountInput);
    setRepayAmountInput('');
    setIsPersonPayModalOpen(false);
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

  // Debt Cell Renderers (Clean Badges without Row-Level Pay Buttons)
  const debtRenderers = {
    debtType: (val) => (
      <span style={{ color: val === 'CREDIT' ? 'var(--accent-emerald)' : 'var(--accent-danger)', fontWeight: '700' }}>
        {val === 'CREDIT' ? '🟢 Lent' : '🔴 Borrowed'}
      </span>
    ),
    givenDate: (val) => <span style={{ color: 'var(--text-muted)', fontSize: '0.82rem', fontFamily: 'var(--font-mono)' }}>{val}</span>,
    dueDate: (val) => (
      <span style={{ color: val !== 'No Due Date' ? 'var(--accent-amber)' : 'var(--text-muted)', fontSize: '0.82rem', fontWeight: '600' }}>
        {val}
      </span>
    ),
    cleanNotes: (val) => <span style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>{val}</span>,
    amount: (val, row) => (
      <div>
        <div style={{ fontFamily: 'var(--font-mono)', fontWeight: '800', fontSize: '0.95rem' }}>
          ${Number(val).toFixed(2)}
        </div>
        <div style={{ fontSize: '0.72rem', color: row.remainingAmt > 0 ? 'var(--accent-amber)' : 'var(--accent-emerald)', marginTop: '0.1rem' }}>
          Rem: ${row.remainingAmt.toFixed(2)}
        </div>
      </div>
    ),
    status: (val, row) => (
      <button
        onClick={(e) => { e.stopPropagation(); toggleDebt(row.id); }}
        style={{
          background: val === 'PAID' ? 'var(--accent-emerald-glow)' : val === 'PARTIAL' ? 'rgba(99, 102, 241, 0.15)' : 'rgba(255, 255, 255, 0.04)',
          border: val === 'PAID' ? '1px solid rgba(16, 185, 129, 0.4)' : val === 'PARTIAL' ? '1px solid rgba(99, 102, 241, 0.4)' : '1px solid var(--border-subtle)',
          color: val === 'PAID' ? 'var(--accent-emerald)' : val === 'PARTIAL' ? 'var(--accent-indigo)' : 'var(--text-muted)',
          padding: '0.4rem 1rem', borderRadius: '9999px', fontSize: '0.78rem', fontWeight: '700', cursor: 'pointer'
        }}
      >
        {val === 'PAID' ? '✅ PAID' : val === 'PARTIAL' ? `💵 ${row.paidPercent.toFixed(0)}% PAID` : '⏳ PENDING'}
      </button>
    )
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
          { key: 'contacts', label: '👥 Interpersonal CRM & Statements' },
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
                <div key={d.id} className="overview-item-row" onClick={() => { setInspectedRecord(d); setInspectedType('DEBT'); }} style={{ cursor: 'pointer' }}>
                  <div>
                    <div style={{ fontWeight: '600', color: 'var(--text-heading)', fontSize: '0.92rem' }}>{d.personName}</div>
                    <div style={{ fontSize: '0.75rem', color: d.debtType === 'CREDIT' ? 'var(--accent-emerald)' : 'var(--accent-danger)', fontWeight: '700', marginTop: '0.15rem' }}>
                      {d.debtType} (Rem: ${d.remainingAmt.toFixed(2)})
                    </div>
                  </div>
                  <Button variant="outline" onClick={(e) => { e.stopPropagation(); toggleDebt(d.id); }} style={{ fontSize: '0.78rem', padding: '0.35rem 0.85rem' }}>
                    {d.status === 'PAID' ? '✅ PAID' : d.status === 'PARTIAL' ? `💵 ${d.paidPercent.toFixed(0)}%` : '⏳ PENDING'}
                  </Button>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* INTERPERSONAL CONTACTS CRM & UNIFIED PERSON STATEMENT */}
      {activeTab === 'contacts' && (
        <div className="finance-data-card">
          
          {!activeContactStatement ? (
            /* ALL CONTACT CARDS SELECTION VIEW */
            <div>
              <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: '700', color: 'var(--text-heading)' }}>Interpersonal Contact CRM & Statements</h3>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Click any contact card below to open their dedicated financial statement and table.</p>
                </div>
                <Button variant="emerald" onClick={() => setIsDebtModalOpen(true)} style={{ fontSize: '0.82rem' }}>
                  🤝 + Add Debt Record
                </Button>
              </div>

              {contactStatements.length === 0 ? (
                <div className="empty-state-box">
                  <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>👥</div>
                  No contact statements found. Add a debt record to auto-provision contacts!
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.25rem', width: '100%' }}>
                  {contactStatements.map(cs => (
                    <motion.div
                      key={cs.person.id}
                      whileHover={{ y: -4 }}
                      onClick={() => setSelectedPersonId(cs.person.id)}
                      style={{
                        background: 'rgba(0,0,0,0.35)',
                        border: '1px solid var(--border-highlight)',
                        borderRadius: '12px',
                        padding: '1.25rem',
                        cursor: 'pointer'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                          <div style={{ width: '38px', height: '38px', borderRadius: '50%', background: 'var(--accent-amber-glow)', color: 'var(--accent-amber)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800', fontSize: '1.1rem' }}>
                            {cs.person.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <h4 style={{ fontSize: '1rem', fontWeight: '700', color: 'var(--text-heading)', margin: 0 }}>{cs.person.name}</h4>
                            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{cs.debts.length} ledger entries</div>
                          </div>
                        </div>
                        <Badge variant={cs.netReceivable >= 0 ? 'emerald' : 'amber'}>
                          {cs.netReceivable >= 0 ? 'Receivable' : 'Payable'}
                        </Badge>
                      </div>

                      <div className="form-grid-2" style={{ gap: '0.75rem', marginBottom: '1rem' }}>
                        <div style={{ background: 'rgba(255,255,255,0.03)', padding: '0.6rem 0.75rem', borderRadius: '6px' }}>
                          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Total Lent</div>
                          <div style={{ fontSize: '0.95rem', fontWeight: '700', color: 'var(--accent-emerald)', fontFamily: 'var(--font-mono)' }}>
                            ${cs.totalLent.toFixed(2)}
                          </div>
                        </div>

                        <div style={{ background: 'rgba(255,255,255,0.03)', padding: '0.6rem 0.75rem', borderRadius: '6px' }}>
                          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Total Borrowed</div>
                          <div style={{ fontSize: '0.95rem', fontWeight: '700', color: 'var(--accent-danger)', fontFamily: 'var(--font-mono)' }}>
                            ${cs.totalBorrowed.toFixed(2)}
                          </div>
                        </div>
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '0.75rem', borderTop: '1px solid rgba(255,255,255,0.05)', fontSize: '0.8rem' }}>
                        <span style={{ color: 'var(--text-muted)' }}>Net Due Balance:</span>
                        <strong style={{ fontFamily: 'var(--font-mono)', fontSize: '1rem', color: cs.netReceivable >= 0 ? 'var(--accent-emerald)' : 'var(--accent-danger)' }}>
                          {cs.netReceivable >= 0 ? '+' : '-'}${Math.abs(cs.netReceivable).toFixed(2)}
                        </strong>
                      </div>

                      <div style={{ marginTop: '0.75rem', textAlign: 'right' }}>
                        <span style={{ fontSize: '0.75rem', color: 'var(--accent-amber)', fontWeight: '700' }}>Open Statement & Table →</span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            /* DEDICATED PERSON STATEMENT & TABLE VIEW WITH TOP ACTION BUTTONS */
            <div>
              {/* Back Bar & Person Title */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <Button variant="secondary" onClick={() => setSelectedPersonId(null)} style={{ fontSize: '0.8rem', padding: '0.4rem 0.75rem' }}>
                    ← Back to All Contacts
                  </Button>
                  <div>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: '800', color: 'var(--text-heading)', margin: 0 }}>
                      👤 Person Statement: {activeContactStatement.person.name}
                    </h3>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.1rem' }}>
                      Auto-reconciles settlement payments across transaction history in FIFO order
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  <Button variant="emerald" onClick={() => setIsPersonPayModalOpen(true)} style={{ fontSize: '0.82rem' }}>
                    💵 + Record Contact Settlement Payment
                  </Button>
                  <Button variant="secondary" onClick={() => { setPersonName(activeContactStatement.person.name); setIsDebtModalOpen(true); }} style={{ fontSize: '0.82rem' }}>
                    🤝 + Add Loan / Debt Entry
                  </Button>
                </div>
              </div>

              {/* Executive Summary Metrics for Person */}
              <div className="form-grid-3" style={{ gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.25rem', marginBottom: '1.75rem' }}>
                <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-subtle)', borderRadius: '10px', padding: '1rem' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Total Money Lent</div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1.4rem', fontWeight: '800', color: 'var(--accent-emerald)', marginTop: '0.2rem' }}>
                    ${activeContactStatement.totalLent.toFixed(2)}
                  </div>
                </div>

                <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-subtle)', borderRadius: '10px', padding: '1rem' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Total Money Borrowed</div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1.4rem', fontWeight: '800', color: 'var(--accent-danger)', marginTop: '0.2rem' }}>
                    ${activeContactStatement.totalBorrowed.toFixed(2)}
                  </div>
                </div>

                <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-subtle)', borderRadius: '10px', padding: '1rem' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Net Outstanding Due Balance</div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1.4rem', fontWeight: '800', color: activeContactStatement.netReceivable >= 0 ? 'var(--accent-emerald)' : 'var(--accent-danger)', marginTop: '0.2rem' }}>
                    {activeContactStatement.netReceivable >= 0 ? '+' : '-'}${Math.abs(activeContactStatement.netReceivable).toFixed(2)}
                  </div>
                </div>
              </div>

              {/* Decoupled Person Statement DataTable */}
              <DataTable
                headers={[
                  'Type',
                  '📅 Date Given',
                  '⏳ Target Due Date',
                  '📝 Context Notes & Reason',
                  'Total & Remaining ($)',
                  'Settlement Status'
                ]}
                keys={[
                  'debtType',
                  'givenDate',
                  'dueDate',
                  'cleanNotes',
                  'amount',
                  'status'
                ]}
                renderers={debtRenderers}
                data={activeContactStatement.debts}
                loading={loading}
                emptyMessage={`No debt records found for ${activeContactStatement.person.name}.`}
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

      {/* TOP CONTACT SETTLEMENT PAYMENT MODAL (FIFO WATERFALL) */}
      <AnimatePresence>
        {isPersonPayModalOpen && activeContactStatement && (
          <div className="modal-overlay">
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="modal-dialog wallet-modal">
              <div className="modal-header">
                <h3 className="modal-title">💵 Record Settlement Payment for {activeContactStatement.person.name}</h3>
                <button onClick={() => setIsPersonPayModalOpen(false)} className="modal-close-btn">✕</button>
              </div>

              <form onSubmit={handlePersonPaySubmit} className="modal-form">
                <div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.4rem' }}>
                    Contact: <strong style={{ color: '#FFF' }}>{activeContactStatement.person.name}</strong>
                  </div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
                    Net Outstanding Balance: <strong style={{ color: activeContactStatement.netReceivable >= 0 ? 'var(--accent-emerald)' : 'var(--accent-danger)', fontFamily: 'var(--font-mono)' }}>{activeContactStatement.netReceivable >= 0 ? '+' : '-'}${Math.abs(activeContactStatement.netReceivable).toFixed(2)}</strong>
                  </div>

                  <label className="form-label">Payment Amount ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="e.g. 2000.00"
                    value={repayAmountInput}
                    onChange={e => setRepayAmountInput(e.target.value)}
                    className="form-input"
                    style={{ fontFamily: 'var(--font-mono)' }}
                    required
                  />

                  <div style={{ color: 'var(--text-muted)', fontSize: '0.78rem', marginTop: '0.6rem', background: 'rgba(255,255,255,0.03)', padding: '0.6rem 0.75rem', borderRadius: '6px' }}>
                    ℹ️ <strong>FIFO Waterfall Reconciliation</strong>: Payment will be applied chronologically starting from the oldest unpaid transaction, automatically updating statuses to <strong>PAID</strong> or <strong>PARTIAL</strong>!
                  </div>
                </div>

                <div className="form-actions">
                  <Button variant="secondary" onClick={() => setIsPersonPayModalOpen(false)}>Cancel</Button>
                  <Button
                    type="submit"
                    variant="emerald"
                    disabled={currentRepayNumber <= 0}
                    style={{
                      opacity: currentRepayNumber <= 0 ? 0.45 : 1,
                      cursor: currentRepayNumber <= 0 ? 'not-allowed' : 'pointer'
                    }}
                  >
                    Confirm & Apply Waterfall Payment →
                  </Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ROW INSPECTION MODAL */}
      <AnimatePresence>
        {inspectedRecord && (
          <div className="modal-overlay">
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="modal-dialog debt-modal">
              <div className="modal-header">
                <div>
                  <h3 className="modal-title">
                    {inspectedType === 'DEBT' ? `🤝 Debt Record: ${inspectedRecord.personName}` : `💸 Transaction: ${inspectedRecord.description || inspectedRecord.category}`}
                  </h3>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                    Record ID #{inspectedRecord.id} • Saved in PostgreSQL
                  </p>
                </div>
                <button onClick={() => setInspectedRecord(null)} className="modal-close-btn">✕</button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                
                {inspectedType === 'DEBT' && (
                  <>
                    <div className="form-grid-2">
                      <div style={{ background: 'rgba(255,255,255,0.03)', padding: '1rem', borderRadius: '8px' }}>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Total Amount</div>
                        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1.5rem', fontWeight: '800', color: '#FFF', marginTop: '0.2rem' }}>
                          ${inspectedRecord.totalAmt.toFixed(2)}
                        </div>
                      </div>

                      <div style={{ background: 'rgba(255,255,255,0.03)', padding: '1rem', borderRadius: '8px' }}>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Remaining Balance</div>
                        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1.5rem', fontWeight: '800', color: inspectedRecord.remainingAmt <= 0 ? 'var(--accent-emerald)' : 'var(--accent-amber)', marginTop: '0.2rem' }}>
                          ${inspectedRecord.remainingAmt.toFixed(2)}
                        </div>
                      </div>
                    </div>

                    {/* Progress Gauge */}
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '0.4rem' }}>
                        <span>Paid: ${inspectedRecord.paidAmt.toFixed(2)}</span>
                        <span>{inspectedRecord.paidPercent.toFixed(1)}% Settled</span>
                      </div>
                      <div style={{ height: '8px', background: 'rgba(255,255,255,0.08)', borderRadius: '9999px', overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${inspectedRecord.paidPercent}%`, background: 'var(--accent-emerald)', transition: 'width 0.4s ease' }} />
                      </div>
                    </div>
                  </>
                )}

                <div className="form-actions">
                  {inspectedType === 'DEBT' && (
                    <Button variant="outline" onClick={() => { toggleDebt(inspectedRecord.id); setInspectedRecord(null); }}>
                      {inspectedRecord.status === 'PAID' ? 'Mark as PENDING' : 'Mark 100% PAID'}
                    </Button>
                  )}
                  <Button variant="secondary" onClick={() => setInspectedRecord(null)}>Close</Button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* CREATE MODALS (Transaction, Debt, Wallet) */}
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
