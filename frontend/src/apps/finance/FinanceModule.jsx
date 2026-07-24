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
 * Featuring Interpersonal Contact Relationship Statements, Unified Person Ledgers, and Over-Repayment Protection.
 * 
 * @author Barkat Bashir
 * @version 20.0.0
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
    recordRepayment,
    toggleDebt
  } = useFinance();

  const [activeTab, setActiveTab] = useState('overview');

  // Modal Visibility
  const [isTxModalOpen, setIsTxModalOpen] = useState(false);
  const [isDebtModalOpen, setIsDebtModalOpen] = useState(false);
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);
  const [isRepayModalOpen, setIsRepayModalOpen] = useState(false);
  const [selectedContactStatement, setSelectedContactStatement] = useState(null);

  // Row Inspection Modal & Repayment target
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

  const handleRepaySubmit = async (e) => {
    e.preventDefault();
    if (!inspectedRecord || !repayAmountInput) return;
    const numericRepay = parseFloat(repayAmountInput);
    if (numericRepay > inspectedRecord.remainingAmt) return;

    await recordRepayment(inspectedRecord.id, repayAmountInput);
    setRepayAmountInput('');
    setIsRepayModalOpen(false);
    setInspectedRecord(null);
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

  // Debt Cell Renderers (With Progress Gauge & Remaining Balance)
  const debtRenderers = {
    personName: (val) => <span style={{ fontWeight: '700', color: 'var(--text-heading)' }}>{val}</span>,
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
    debtType: (val) => (
      <span style={{ color: val === 'CREDIT' ? 'var(--accent-emerald)' : 'var(--accent-danger)', fontWeight: '700' }}>
        {val}
      </span>
    ),
    givenDate: (val) => <span style={{ color: 'var(--text-muted)', fontSize: '0.82rem', fontFamily: 'var(--font-mono)' }}>{val}</span>,
    dueDate: (val) => (
      <span style={{ color: val !== 'No Due Date' ? 'var(--accent-amber)' : 'var(--text-muted)', fontSize: '0.82rem', fontWeight: '600' }}>
        {val}
      </span>
    ),
    cleanNotes: (val) => <span style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>{val}</span>,
    status: (val, row) => (
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <button
          onClick={(e) => { e.stopPropagation(); toggleDebt(row.id); }}
          style={{
            background: val === 'PAID' ? 'var(--accent-emerald-glow)' : val === 'PARTIAL' ? 'rgba(99, 102, 241, 0.15)' : 'rgba(255, 255, 255, 0.04)',
            border: val === 'PAID' ? '1px solid rgba(16, 185, 129, 0.4)' : val === 'PARTIAL' ? '1px solid rgba(99, 102, 241, 0.4)' : '1px solid var(--border-subtle)',
            color: val === 'PAID' ? 'var(--accent-emerald)' : val === 'PARTIAL' ? 'var(--accent-indigo)' : 'var(--text-muted)',
            padding: '0.35rem 0.85rem', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: '700', cursor: 'pointer'
          }}
        >
          {val === 'PAID' ? '✅ PAID' : val === 'PARTIAL' ? `💵 ${row.paidPercent.toFixed(0)}% PAID` : '⏳ PENDING'}
        </button>
      </div>
    )
  };

  const currentRepayNumber = parseFloat(repayAmountInput) || 0;
  const isOverpaid = inspectedRecord && currentRepayNumber > inspectedRecord.remainingAmt;

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
          { key: 'debts', label: '🤝 Debt Settlement (/debts)' },
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

      {/* INTERPERSONAL CONTACTS CRM & UNIFIED STATEMENTS TAB */}
      {activeTab === 'contacts' && (
        <div className="finance-data-card">
          <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: '700', color: 'var(--text-heading)' }}>Interpersonal Contact CRM & Statements</h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Browse financial relationships, total money lent/borrowed, and unified transaction statements per person.</p>
            </div>
            <Button variant="emerald" onClick={() => setIsDebtModalOpen(true)} style={{ fontSize: '0.82rem' }}>
              🤝 + Add Person Debt Record
            </Button>
          </div>

          {contactStatements.length === 0 ? (
            <div className="empty-state-box">
              <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>👥</div>
              No contact relationship statements yet. Add a debt record to auto-provision contacts!
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.25rem', width: '100%' }}>
              {contactStatements.map(cs => (
                <motion.div
                  key={cs.person.id}
                  whileHover={{ y: -4 }}
                  onClick={() => setSelectedContactStatement(cs)}
                  style={{
                    background: 'rgba(0,0,0,0.35)',
                    border: '1px solid var(--border-highlight)',
                    borderRadius: '12px',
                    padding: '1.25rem',
                    cursor: 'pointer',
                    position: 'relative',
                    overflow: 'hidden'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                      <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'var(--accent-amber-glow)', color: 'var(--accent-amber)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800', fontSize: '1rem' }}>
                        {cs.person.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h4 style={{ fontSize: '1rem', fontWeight: '700', color: 'var(--text-heading)', margin: 0 }}>{cs.person.name}</h4>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{cs.debts.length} debt entries</div>
                      </div>
                    </div>
                    <Badge variant={cs.netReceivable >= 0 ? 'emerald' : 'amber'}>
                      {cs.netReceivable >= 0 ? 'Receivable' : 'Payable'}
                    </Badge>
                  </div>

                  <div className="form-grid-2" style={{ gap: '0.75rem', marginBottom: '1rem' }}>
                    <div style={{ background: 'rgba(255,255,255,0.03)', padding: '0.6rem 0.75rem', borderRadius: '6px' }}>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Lent (Credit)</div>
                      <div style={{ fontSize: '0.95rem', fontWeight: '700', color: 'var(--accent-emerald)', fontFamily: 'var(--font-mono)' }}>
                        ${cs.totalLent.toFixed(2)}
                      </div>
                    </div>

                    <div style={{ background: 'rgba(255,255,255,0.03)', padding: '0.6rem 0.75rem', borderRadius: '6px' }}>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Borrowed (Debit)</div>
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
                    <span style={{ fontSize: '0.75rem', color: 'var(--accent-amber)', fontWeight: '600' }}>View Unified Statement →</span>
                  </div>
                </motion.div>
              ))}
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

      {/* DEBTS TAB */}
      {activeTab === 'debts' && (
        <div className="finance-data-card">
          <div style={{ marginBottom: '1.5rem' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: '700', color: 'var(--text-heading)' }}>Interpersonal Debt Ledger (/debts)</h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Click any row to record partial repayments or inspect itemized breakdown.</p>
          </div>

          <DataTable
            headers={[
              'Contact Person',
              'Total & Remaining ($)',
              'Type',
              '📅 Date Given / Lent',
              '⏳ Target Due Date',
              '📝 Context Notes & Reason',
              'Settlement Status'
            ]}
            keys={[
              'personName',
              'amount',
              'debtType',
              'givenDate',
              'dueDate',
              'cleanNotes',
              'status'
            ]}
            renderers={debtRenderers}
            data={debts}
            loading={loading}
            emptyMessage="No interpersonal debt records found."
            onRowClick={(row) => { setInspectedRecord(row); setInspectedType('DEBT'); }}
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

      {/* UNIFIED CONTACT STATEMENT DRAWER / MODAL */}
      <AnimatePresence>
        {selectedContactStatement && (
          <div className="modal-overlay">
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="modal-dialog tx-modal" style={{ maxWidth: '750px' }}>
              <div className="modal-header">
                <div>
                  <h3 className="modal-title">👤 Unified Statement: {selectedContactStatement.person.name}</h3>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                    Chronological history of all loans, debts, repayments & transactions with {selectedContactStatement.person.name}
                  </p>
                </div>
                <button onClick={() => setSelectedContactStatement(null)} className="modal-close-btn">✕</button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                
                {/* Executive Contact Summary Header */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', background: 'rgba(255,255,255,0.03)', padding: '1rem', borderRadius: '8px' }}>
                  <div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Total Money Lent</div>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1.2rem', fontWeight: '800', color: 'var(--accent-emerald)' }}>
                      ${selectedContactStatement.totalLent.toFixed(2)}
                    </div>
                  </div>

                  <div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Total Money Borrowed</div>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1.2rem', fontWeight: '800', color: 'var(--accent-danger)' }}>
                      ${selectedContactStatement.totalBorrowed.toFixed(2)}
                    </div>
                  </div>

                  <div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Net Due Balance</div>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1.2rem', fontWeight: '800', color: selectedContactStatement.netReceivable >= 0 ? 'var(--accent-emerald)' : 'var(--accent-danger)' }}>
                      {selectedContactStatement.netReceivable >= 0 ? '+' : '-'}${Math.abs(selectedContactStatement.netReceivable).toFixed(2)}
                    </div>
                  </div>
                </div>

                {/* Unified Ledger Entries */}
                <div>
                  <h4 style={{ fontSize: '0.9rem', fontWeight: '700', color: 'var(--text-heading)', marginBottom: '0.75rem' }}>📑 Unified Debt & Transaction Logs</h4>
                  {selectedContactStatement.debts.length === 0 && selectedContactStatement.transactions.length === 0 ? (
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>No records found for this person.</div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '300px', overflowY: 'auto' }}>
                      {selectedContactStatement.debts.map(d => (
                        <div key={d.id} className="overview-item-row" onClick={() => { setInspectedRecord(d); setInspectedType('DEBT'); }} style={{ cursor: 'pointer' }}>
                          <div>
                            <div style={{ fontWeight: '600', color: 'var(--text-heading)', fontSize: '0.88rem' }}>
                              🤝 {d.debtType === 'CREDIT' ? 'Money Lent' : 'Money Borrowed'} — {d.cleanNotes}
                            </div>
                            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
                              Given: {d.givenDate} • Due: {d.dueDate}
                            </div>
                          </div>
                          <div style={{ textAlign: 'right' }}>
                            <div style={{ fontFamily: 'var(--font-mono)', fontWeight: '700', fontSize: '0.95rem', color: d.debtType === 'CREDIT' ? 'var(--accent-emerald)' : 'var(--accent-danger)' }}>
                              ${d.totalAmt.toFixed(2)}
                            </div>
                            <div style={{ fontSize: '0.7rem', color: 'var(--accent-amber)' }}>
                              {d.status === 'PAID' ? '✅ PAID' : `Rem: $${d.remainingAmt.toFixed(2)}`}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="form-actions">
                  <Button variant="emerald" onClick={() => { setPersonName(selectedContactStatement.person.name); setIsDebtModalOpen(true); }}>
                    🤝 + Add New Debt for {selectedContactStatement.person.name}
                  </Button>
                  <Button variant="secondary" onClick={() => setSelectedContactStatement(null)}>Close Statement</Button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ROW INSPECTION & PARTIAL REPAYMENT MODAL */}
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
                    <>
                      <Button
                        variant="emerald"
                        disabled={inspectedRecord.remainingAmt <= 0}
                        onClick={() => setIsRepayModalOpen(true)}
                        style={{
                          opacity: inspectedRecord.remainingAmt <= 0 ? 0.45 : 1,
                          cursor: inspectedRecord.remainingAmt <= 0 ? 'not-allowed' : 'pointer'
                        }}
                      >
                        {inspectedRecord.remainingAmt <= 0 ? '✅ Fully Settled (No Balance Due)' : '💵 Record Partial Payment'}
                      </Button>
                      <Button variant="outline" onClick={() => { toggleDebt(inspectedRecord.id); setInspectedRecord(null); }}>
                        {inspectedRecord.status === 'PAID' ? 'Mark as PENDING' : 'Mark 100% PAID'}
                      </Button>
                    </>
                  )}
                  <Button variant="secondary" onClick={() => setInspectedRecord(null)}>Close</Button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* PARTIAL REPAYMENT INPUT MODAL WITH OVER-PAYMENT PROTECTION */}
      <AnimatePresence>
        {isRepayModalOpen && inspectedRecord && (
          <div className="modal-overlay">
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="modal-dialog wallet-modal">
              <div className="modal-header">
                <h3 className="modal-title">💵 Record Partial Repayment</h3>
                <button onClick={() => setIsRepayModalOpen(false)} className="modal-close-btn">✕</button>
              </div>

              <form onSubmit={handleRepaySubmit} className="modal-form">
                <div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.4rem' }}>
                    Contact: <strong style={{ color: '#FFF' }}>{inspectedRecord.personName}</strong>
                  </div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
                    Remaining Balance Due: <strong style={{ color: 'var(--accent-amber)', fontFamily: 'var(--font-mono)' }}>${inspectedRecord.remainingAmt.toFixed(2)}</strong>
                  </div>

                  <label className="form-label">Repayment Amount ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    max={inspectedRecord.remainingAmt}
                    placeholder={`Max $${inspectedRecord.remainingAmt.toFixed(2)}`}
                    value={repayAmountInput}
                    onChange={e => setRepayAmountInput(e.target.value)}
                    className="form-input"
                    style={{
                      fontFamily: 'var(--font-mono)',
                      borderColor: isOverpaid ? 'var(--accent-danger)' : 'var(--border-subtle)'
                    }}
                    required
                  />

                  {isOverpaid && (
                    <div style={{ color: 'var(--accent-danger)', fontSize: '0.78rem', marginTop: '0.4rem', fontWeight: '600' }}>
                      ⚠️ Repayment (${currentRepayNumber.toFixed(2)}) cannot exceed remaining balance of ${inspectedRecord.remainingAmt.toFixed(2)}.
                    </div>
                  )}
                </div>

                <div className="form-actions">
                  <Button variant="secondary" onClick={() => setIsRepayModalOpen(false)}>Cancel</Button>
                  <Button
                    type="submit"
                    variant="emerald"
                    disabled={isOverpaid || currentRepayNumber <= 0}
                    style={{
                      opacity: isOverpaid || currentRepayNumber <= 0 ? 0.45 : 1,
                      cursor: isOverpaid || currentRepayNumber <= 0 ? 'not-allowed' : 'pointer'
                    }}
                  >
                    Confirm & Apply Repayment →
                  </Button>
                </div>
              </form>
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
