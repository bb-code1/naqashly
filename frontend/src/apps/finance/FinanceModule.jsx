import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { DataTable } from '../../components/ui/DataTable';
import { ConfirmModal } from '../../components/ui/ConfirmModal';
import { useFinance } from '../../hooks/useFinance';
import {
  DEBT_PURPOSE_CATEGORIES,
  TRANSACTION_TYPES
} from '../../constants/financeConstants';
import './FinanceModule.css';

/**
 * Bank-Grade Double-Entry Interpersonal Ledger Suite, Spending Analytics & PostgreSQL Category Budget Engine.
 * Fixed Light Mode Unselected Button Visibility (var(--text-heading) text color), Compact Category Modal (500px).
 * Single Horizontal Metric Row, 2 Fundamental Event Direction Terms, Unified Budget Health Cards with 3-Tier Visual Progress Bars.
 * Fully theme-aware supporting Obsidian Dark, Luxe Light, Cyberpunk, and Forest themes!
 * 
 * @author Barkat Bashir
 * @version 35.0.0
 */
export const FinanceModule = ({ activeSubTab, onSelectSubTab }) => {
  const {
    wallets,
    transactions,
    categories,
    contactStatements,
    loading,
    netCreditSum,
    netDebitSum,
    totalWalletBalance,
    totalInflow,
    totalOutflow,
    netSavings,
    savingsRate,
    categoryBreakdown,
    budgetHealthList,
    totalOverallBudget,
    updateCategoryBudget,
    addCategory,
    deleteCategory,
    addDebt,
    updateDebt,
    deleteDebt,
    batchDeleteDebts,
    addWallet,
    addTransaction
  } = useFinance();

  const [internalTab, setInternalTab] = useState('overview');
  const activeTab = activeSubTab || internalTab;
  const setActiveTab = (tabKey) => {
    setInternalTab(tabKey);
    if (onSelectSubTab) onSelectSubTab(tabKey);
  };

  // Modal Visibility
  const [isTxModalOpen, setIsTxModalOpen] = useState(false);
  const [isDebtModalOpen, setIsDebtModalOpen] = useState(false);
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [selectedPersonId, setSelectedPersonId] = useState(null);

  // Budget Edit State
  const [editingCatId, setEditingCatId] = useState(null);
  const [newBudgetVal, setNewBudgetVal] = useState('');

  // New Category Form State
  const [newCatName, setNewCatName] = useState('');
  const [newCatType, setNewCatType] = useState('EXPENSE');
  const [newCatIcon, setNewCatIcon] = useState('🏋️');
  const [newCatColor, setNewCatColor] = useState('#3B82F6');
  const [newCatBudget, setNewCatBudget] = useState('10000');

  // Statement Filter State
  const [dateRangeFilter, setDateRangeFilter] = useState('ALL_TIME');
  const [eventTypeFilter, setEventTypeFilter] = useState('ALL_TYPES'); // 'ALL_TYPES' | 'PAYMENT_OUT' | 'PAYMENT_IN'

  // Row Edit / Delete Modal State
  const [editingRecord, setEditingRecord] = useState(null);
  const [editAmount, setEditAmount] = useState('');
  const [editType, setEditType] = useState('GIVE_LOAN');
  const [editNotes, setEditNotes] = useState('');

  // Confirm Modal State
  const [confirmConfig, setConfirmConfig] = useState({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {}
  });

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
  const [category, setCategory] = useState('');
  const [noteContent, setNoteContent] = useState('');

  // Active Person Statement Selection
  const activeContactStatement = contactStatements.find(cs => cs.person.id === selectedPersonId) || null;

  // Filtered Contact Statement Rows
  const filteredStatementDebts = useMemo(() => {
    if (!activeContactStatement) return [];

    const now = new Date();

    return activeContactStatement.debts.filter(d => {
      if (eventTypeFilter === 'PAYMENT_OUT') {
        if (d.debtType !== 'GIVE_LOAN' && d.debtType !== 'MAKE_PAYMENT' && d.debtType !== 'CREDIT') return false;
      } else if (eventTypeFilter === 'PAYMENT_IN') {
        if (d.debtType !== 'TAKE_LOAN' && d.debtType !== 'RECEIVE_PAYMENT' && d.debtType !== 'DEBIT') return false;
      }

      if (dateRangeFilter === 'ALL_TIME') return true;

      const recordDate = d.createdAt ? new Date(d.createdAt) : new Date();

      if (dateRangeFilter === 'THIS_MONTH') {
        return recordDate.getMonth() === now.getMonth() && recordDate.getFullYear() === now.getFullYear();
      }

      if (dateRangeFilter === 'LAST_30_DAYS') {
        const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        return recordDate >= thirtyDaysAgo;
      }

      if (dateRangeFilter === 'THIS_YEAR') {
        return recordDate.getFullYear() === now.getFullYear();
      }

      return true;
    });
  }, [activeContactStatement, eventTypeFilter, dateRangeFilter]);

  // Submit Handlers
  const handleDebtSubmit = async (e) => {
    e.preventDefault();
    await addDebt({ personName, amount: debtAmount, debtType, dueDate, debtCategory, debtNotes });
    setPersonName(''); setDebtAmount(''); setDueDate(''); setDebtNotes('');
    setIsDebtModalOpen(false);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!editingRecord) return;
    await updateDebt(editingRecord.id, { amount: editAmount, type: editType, notes: editNotes });
    setEditingRecord(null);
  };

  const requestSingleDelete = (id) => {
    setConfirmConfig({
      isOpen: true,
      title: '🗑️ Delete Ledger Transaction',
      message: `Are you sure you want to delete Ledger Transaction #${id}? This will update the contact's running net balance statement.`,
      onConfirm: async () => {
        await deleteDebt(id);
        setEditingRecord(null);
      }
    });
  };

  const requestBatchDelete = (selectedIds) => {
    setConfirmConfig({
      isOpen: true,
      title: `🗑️ Delete ${selectedIds.length} Selected Entries`,
      message: `Are you sure you want to delete ${selectedIds.length} selected ledger transactions at once? This action cannot be undone.`,
      onConfirm: async () => {
        await batchDeleteDebts(selectedIds);
      }
    });
  };

  const handleWalletSubmit = async (e) => {
    e.preventDefault();
    await addWallet({ name: walletName, balance: initialBalance });
    setWalletName(''); setInitialBalance('');
    setIsWalletModalOpen(false);
  };

  const handleTxSubmit = async (e) => {
    e.preventDefault();
    const selCat = category || (categories[0]?.name || 'Food & Dining');
    await addTransaction({ amount: txAmount, txType, category: selCat, noteContent });
    setTxAmount(''); setNoteContent('');
    setIsTxModalOpen(false);
  };

  const handleCreateCategorySubmit = async (e) => {
    e.preventDefault();
    await addCategory({ name: newCatName, type: newCatType, icon: newCatIcon, color: newCatColor, targetBudget: newCatBudget });
    setNewCatName(''); setNewCatBudget('10000');
    setIsCategoryModalOpen(false);
  };

  const handleSaveBudgetLimit = async (catId) => {
    if (newBudgetVal && !isNaN(newBudgetVal)) {
      await updateCategoryBudget(catId, newBudgetVal);
    }
    setEditingCatId(null);
    setNewBudgetVal('');
  };

  // Open Edit / Detail Inspection Modal for a Record
  const openEditModal = (record) => {
    setEditingRecord(record);
    setEditAmount(record.totalAmt || record.amount);
    setEditType(record.debtType || 'GIVE_LOAN');
    setEditNotes(record.cleanNotes || record.notes || '');
  };

  // Live Over-Budget Check inside Modal Form in INR (₹)
  const liveFormOverBudgetWarning = useMemo(() => {
    if (txType !== 'EXPENSE' || !txAmount || isNaN(txAmount)) return null;

    const catName = category || (categories[0]?.name || 'Food & Dining');
    const catItem = budgetHealthList.find(b => b.category.toLowerCase().trim() === catName.toLowerCase().trim());
    if (!catItem) return null;

    const limit = catItem.limit;
    const currentSpent = catItem.spent;
    const numAmt = parseFloat(txAmount);

    if (currentSpent + numAmt > limit && limit > 0) {
      const overBy = (currentSpent + numAmt) - limit;
      return { category: catItem.category, limit, currentSpent, newTotal: currentSpent + numAmt, overBy };
    }

    return null;
  }, [txType, txAmount, category, categories, budgetHealthList]);

  // Transaction Cell Renderers
  const transactionRenderers = {
    description: (val) => <span style={{ fontWeight: '500' }}>{val || 'General Log'}</span>,
    category: (val) => <span style={{ color: 'var(--text-muted)' }}>{val}</span>,
    amount: (val, row) => {
      const isIncome = row?.transactionType === 'INCOME' || row?.type === 'INCOME';
      return (
        <span style={{ fontFamily: 'var(--font-mono)', fontWeight: '700', color: isIncome ? 'var(--accent-emerald)' : 'var(--accent-danger)' }}>
          {isIncome ? '+' : '-'}₹{Number(val || 0).toFixed(2)}
        </span>
      );
    },
    transactionType: (val) => <Badge variant={val === 'INCOME' ? 'emerald' : 'amber'}>{val || 'EXPENSE'}</Badge>
  };

  // Simplified 2-Term Directional Statement Renderers
  const statementRenderers = {
    debtType: (val) => {
      const isOut = val === 'GIVE_LOAN' || val === 'MAKE_PAYMENT' || val === 'CREDIT';
      return (
        <span style={{ color: isOut ? 'var(--accent-emerald)' : 'var(--accent-danger)', fontWeight: '700', fontSize: '0.85rem' }}>
          {isOut ? '🟢 Payment Out (Money Sent)' : '💵 Payment In (Money Recv)'}
        </span>
      );
    },
    givenDate: (val) => <span style={{ color: 'var(--text-muted)', fontSize: '0.82rem', fontFamily: 'var(--font-mono)' }}>{val}</span>,
    amount: (val, row) => {
      const isOut = row.debtType === 'GIVE_LOAN' || row.debtType === 'MAKE_PAYMENT' || row.debtType === 'CREDIT';
      return (
        <span style={{ fontFamily: 'var(--font-mono)', fontWeight: '700', color: isOut ? 'var(--accent-emerald)' : 'var(--accent-danger)' }}>
          {isOut ? '+' : '-'}₹{Number(val).toFixed(2)}
        </span>
      );
    },
    runningBalance: (val) => (
      <span style={{ fontFamily: 'var(--font-mono)', fontWeight: '800', fontSize: '0.95rem', color: val >= 0 ? 'var(--accent-emerald)' : 'var(--accent-danger)' }}>
        {val >= 0 ? '+' : '-'}₹{Math.abs(val).toFixed(2)}
      </span>
    ),
    cleanNotes: (val) => <span style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>{val}</span>
  };

  return (
    <div className="finance-container">
      
      {/* 1. EXECUTIVE METRIC HEADER IN INR (₹) */}
      <div className="finance-metric-grid">
        <motion.div whileHover={{ y: -3 }} className="metric-card-base metric-card-networth">
          <div className="metric-label-row">
            <span className="metric-title">Total Liquid Net Worth</span>
            <Badge variant="amber">PostgreSQL Live (INR)</Badge>
          </div>
          <div className="metric-value value-amber">₹{totalWalletBalance.toFixed(2)}</div>
          <div className="metric-subtitle">Across {wallets.length} active wallets</div>
        </motion.div>

        <motion.div whileHover={{ y: -3 }} className="metric-card-base metric-card-credit">
          <div className="metric-title">Money Owed To You (Credit)</div>
          <div className="metric-value value-emerald">+₹{netCreditSum.toFixed(2)}</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--accent-emerald)', fontWeight: '600' }}>✓ Net Receivables</div>
        </motion.div>

        <motion.div whileHover={{ y: -3 }} className="metric-card-base metric-card-debit">
          <div className="metric-title">Money You Owe (Debit)</div>
          <div className="metric-value value-danger">-₹{netDebitSum.toFixed(2)}</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--accent-danger)', fontWeight: '600' }}>⚠️ Net Payables</div>
        </motion.div>

        <div className="metric-card-actions">
          <Button variant="emerald" type="button" onClick={() => { if (categories.length > 0) setCategory(categories[0].name); setIsTxModalOpen(true); }} style={{ width: '100%', padding: '0.6rem 0.85rem', fontSize: '0.82rem', justifyContent: 'center' }}>
            💸 + Log Transaction
          </Button>
          <Button variant="secondary" type="button" onClick={() => { setPersonName(''); setIsDebtModalOpen(true); }} style={{ width: '100%', padding: '0.6rem 0.85rem', fontSize: '0.82rem', justifyContent: 'center' }}>
            🤝 + Ledger Entry
          </Button>
          <Button variant="outline" type="button" onClick={() => setIsWalletModalOpen(true)} style={{ width: '100%', padding: '0.6rem 0.85rem', fontSize: '0.82rem', justifyContent: 'center', border: '1px solid var(--border-subtle)' }}>
            💳 + Add Wallet
          </Button>
        </div>
      </div>

      {/* 2. SUB-TABS BAR */}
      <div className="finance-subtab-bar">
        {[
          { key: 'overview', label: '📊 Overview' },
          { key: 'analytics', label: '📈 Spending & Budget Health' },
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
                  <Button variant="emerald" type="button" onClick={() => { if (categories.length > 0) setCategory(categories[0].name); setIsTxModalOpen(true); }} style={{ fontSize: '0.8rem' }}>
                    + Log First Transaction
                  </Button>
                </div>
              </div>
            ) : (
              transactions.slice(0, 5).map(t => (
                <div key={t.id} className="overview-item-row" style={{ cursor: 'pointer' }}>
                  <div>
                    <div style={{ fontWeight: '600', color: 'var(--text-heading)', fontSize: '0.92rem' }}>{t.description || t.category}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>{t.category}</div>
                  </div>
                  <div className={`metric-value ${t.transactionType === 'INCOME' ? 'value-emerald' : 'value-danger'}`} style={{ fontSize: '1rem', margin: 0 }}>
                    {t.transactionType === 'INCOME' ? '+' : '-'}₹{Number(t.amount).toFixed(2)}
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
                  <Button variant="secondary" type="button" onClick={() => setIsDebtModalOpen(true)} style={{ fontSize: '0.8rem' }}>
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
                    {cs.netReceivable >= 0 ? '+' : '-'}₹{Math.abs(cs.netReceivable).toFixed(2)}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* SPENDING ANALYTICS & POSTGRESQL CATEGORY BUDGET HEALTH TAB (COMPACT 1-ROW SUMMARY) */}
      {activeTab === 'analytics' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', width: '100%' }}>
          
          {/* CONSOLIDATED SINGLE HORIZONTAL ROW WITH 4 SIDE-BY-SIDE METRIC COLUMNS */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '0.5rem' }}>
            
            <div style={{ background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-subtle)', borderRadius: '10px', padding: '0.85rem 1.15rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: '600' }}>Total Monthly Inflow</div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1.25rem', fontWeight: '800', color: 'var(--accent-emerald)', marginTop: '0.15rem' }}>
                  +₹{totalInflow.toFixed(2)}
                </div>
              </div>
              <span style={{ fontSize: '1.5rem' }}>💰</span>
            </div>

            <div style={{ background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-subtle)', borderRadius: '10px', padding: '0.85rem 1.15rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: '600' }}>Total Monthly Outflow</div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1.25rem', fontWeight: '800', color: 'var(--accent-danger)', marginTop: '0.15rem' }}>
                  -₹{totalOutflow.toFixed(2)}
                </div>
              </div>
              <span style={{ fontSize: '1.5rem' }}>💸</span>
            </div>

            <div style={{ background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-subtle)', borderRadius: '10px', padding: '0.85rem 1.15rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: '600' }}>Total Target Budget</div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1.25rem', fontWeight: '800', color: 'var(--text-heading)', marginTop: '0.15rem' }}>
                  ₹{totalOverallBudget.toFixed(2)}
                </div>
              </div>
              <span style={{ fontSize: '1.5rem' }}>🎯</span>
            </div>

            <div style={{ background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-subtle)', borderRadius: '10px', padding: '0.85rem 1.15rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: '600' }}>Overall Budget Health</div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1.25rem', fontWeight: '800', color: totalOutflow > totalOverallBudget ? 'var(--accent-danger)' : 'var(--accent-emerald)', marginTop: '0.15rem' }}>
                  {totalOverallBudget > 0 ? ((totalOutflow / totalOverallBudget) * 100).toFixed(1) : 0}% Used
                </div>
              </div>
              <span style={{ fontSize: '1.5rem' }}>📊</span>
            </div>

          </div>

          {/* PostgreSQL Category Health & Target Budget Cards with 3-Tier Visual Fill */}
          <div className="finance-data-card">
            <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: '800', color: 'var(--text-heading)', margin: 0 }}>
                  🎯 PostgreSQL Category Budget Health & Target Allocation
                </h3>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                  Real-time budget tracking in INR (₹) backed by PostgreSQL database
                </p>
              </div>

              <Button variant="emerald" type="button" onClick={() => setIsCategoryModalOpen(true)} style={{ fontSize: '0.82rem' }}>
                ➕ Add Custom Category
              </Button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', width: '100%' }}>
              {budgetHealthList.map((item) => {
                const isEditingThis = editingCatId === item.id;

                let barColor = item.color || '#3B82F6';
                if (item.isOver) barColor = '#EF4444';
                else if (item.isNear) barColor = '#F59E0B';

                return (
                  <div
                    key={item.id}
                    style={{
                      background: 'var(--bg-surface-elevated)',
                      border: item.isOver ? '1px solid rgba(239, 68, 68, 0.5)' : '1px solid var(--border-subtle)',
                      boxShadow: item.isOver ? '0 4px 20px rgba(239, 68, 68, 0.15)' : 'none',
                      borderRadius: '12px',
                      padding: '1.25rem'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                        <span style={{ fontSize: '1.35rem' }}>{item.icon}</span>
                        <div>
                          <span style={{ fontSize: '1rem', fontWeight: '800', color: 'var(--text-heading)' }}>
                            {item.category}
                          </span>
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginLeft: '0.6rem' }}>
                            ₹{item.spent.toFixed(2)} spent of ₹{item.limit.toFixed(2)} target
                          </span>
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                        {isEditingThis ? (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                            <input
                              type="number"
                              value={newBudgetVal}
                              onChange={e => setNewBudgetVal(e.target.value)}
                              placeholder={item.limit}
                              style={{
                                width: '90px',
                                padding: '0.25rem 0.5rem',
                                borderRadius: '6px',
                                border: '1px solid var(--border-highlight)',
                                background: 'var(--bg-surface)',
                                color: 'var(--text-heading)',
                                fontSize: '0.85rem',
                                fontFamily: 'var(--font-mono)'
                              }}
                            />
                            <button
                              type="button"
                              onClick={() => handleSaveBudgetLimit(item.id)}
                              style={{ padding: '0.25rem 0.5rem', borderRadius: '6px', background: 'var(--accent-emerald)', border: 'none', color: '#FFF', fontSize: '0.75rem', cursor: 'pointer', fontWeight: '700' }}
                            >
                              Save
                            </button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => { setEditingCatId(item.id); setNewBudgetVal(item.limit); }}
                            style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '0.78rem', cursor: 'pointer', textDecoration: 'underline' }}
                            title="Edit Monthly Target Limit in DB"
                          >
                            ✏️ Target: ₹{item.limit}
                          </button>
                        )}

                        {item.isOver ? (
                          <Badge variant="amber">🔴 Over Budget by ₹{Math.abs(item.remaining).toFixed(2)}</Badge>
                        ) : item.isNear ? (
                          <Badge variant="amber">🟡 Near Limit (₹{item.remaining.toFixed(2)} left)</Badge>
                        ) : (
                          <Badge variant="emerald">🟢 ₹{item.remaining.toFixed(2)} Left</Badge>
                        )}

                        <button
                          type="button"
                          onClick={() => deleteCategory(item.id)}
                          style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '0.8rem', cursor: 'pointer', opacity: 0.5 }}
                          title="Delete Custom Category"
                        >
                          ✕
                        </button>
                      </div>
                    </div>

                    {/* 3-Tier Visual Health Fill */}
                    <div style={{ width: '100%', height: '10px', background: 'var(--bg-surface)', borderRadius: '5px', overflow: 'hidden' }}>
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${item.percentage}%` }}
                        transition={{ duration: 0.8, ease: 'easeOut' }}
                        style={{ height: '100%', background: barColor, borderRadius: '5px' }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
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
                <Button variant="emerald" type="button" onClick={() => { setPersonName(''); setIsDebtModalOpen(true); }} style={{ fontSize: '0.82rem' }}>
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
                            ₹{cs.totalLent.toFixed(2)}
                          </div>
                        </div>

                        <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', padding: '0.6rem 0.75rem', borderRadius: '6px' }}>
                          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Total Borrowed</div>
                          <div style={{ fontSize: '0.95rem', fontWeight: '700', color: 'var(--accent-danger)', fontFamily: 'var(--font-mono)' }}>
                            ₹{cs.totalBorrowed.toFixed(2)}
                          </div>
                        </div>
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '0.75rem', borderTop: '1px solid var(--border-subtle)', fontSize: '0.8rem' }}>
                        <span style={{ color: 'var(--text-muted)' }}>Net Running Balance:</span>
                        <strong style={{ fontFamily: 'var(--font-mono)', fontSize: '1.05rem', color: cs.netReceivable >= 0 ? 'var(--accent-emerald)' : 'var(--accent-danger)' }}>
                          {cs.netReceivable >= 0 ? '+' : '-'}₹{Math.abs(cs.netReceivable).toFixed(2)}
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
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.85rem', flexWrap: 'wrap', gap: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <Button variant="secondary" type="button" onClick={() => setSelectedPersonId(null)} style={{ fontSize: '0.8rem', padding: '0.4rem 0.75rem' }}>
                    ← Back to All Accounts
                  </Button>
                  <div>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: '800', color: 'var(--text-heading)', margin: 0 }}>
                      🏦 Bank Statement: {activeContactStatement.person.name}
                    </h3>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.1rem' }}>
                      Double-entry immutable running balance ledger (INR ₹)
                    </div>
                  </div>
                </div>

                {/* STATEMENT FILTER DROPDOWNS BAR */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: '600' }}>📅 Date:</span>
                    <select
                      value={dateRangeFilter}
                      onChange={e => setDateRangeFilter(e.target.value)}
                      style={{
                        padding: '0.4rem 0.75rem',
                        borderRadius: '8px',
                        background: 'var(--bg-surface-elevated)',
                        border: '1px solid var(--border-subtle)',
                        color: 'var(--text-heading)',
                        fontSize: '0.8rem',
                        fontWeight: '600',
                        outline: 'none',
                        cursor: 'pointer'
                      }}
                    >
                      <option value="ALL_TIME">All-Time History</option>
                      <option value="THIS_MONTH">This Month</option>
                      <option value="LAST_30_DAYS">Last 30 Days</option>
                      <option value="THIS_YEAR">This Year (2026)</option>
                    </select>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: '600' }}>🏷️ Event:</span>
                    <select
                      value={eventTypeFilter}
                      onChange={e => setEventTypeFilter(e.target.value)}
                      style={{
                        padding: '0.4rem 0.75rem',
                        borderRadius: '8px',
                        background: 'var(--bg-surface-elevated)',
                        border: '1px solid var(--border-subtle)',
                        color: 'var(--text-heading)',
                        fontSize: '0.8rem',
                        fontWeight: '600',
                        outline: 'none',
                        cursor: 'pointer'
                      }}
                    >
                      <option value="ALL_TYPES">All Event Types</option>
                      <option value="PAYMENT_OUT">🟢 Payment Out (Money Sent)</option>
                      <option value="PAYMENT_IN">💵 Payment In (Money Recv)</option>
                    </select>
                  </div>

                  <Button variant="emerald" type="button" onClick={() => { setPersonName(activeContactStatement.person.name); setIsDebtModalOpen(true); }} style={{ fontSize: '0.82rem' }}>
                    💸 + Record Transaction
                  </Button>
                </div>
              </div>

              {/* CONSOLIDATED SINGLE HORIZONTAL ROW WITH 3 SIDE-BY-SIDE COLUMNS IN INR (₹) */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '1.25rem' }}>
                <div style={{ background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-subtle)', borderRadius: '10px', padding: '0.85rem 1.15rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: '600' }}>Total Money Sent / Lent</div>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1.25rem', fontWeight: '800', color: 'var(--accent-emerald)', marginTop: '0.15rem' }}>
                      ₹{activeContactStatement.totalLent.toFixed(2)}
                    </div>
                  </div>
                  <span style={{ fontSize: '1.5rem' }}>🟢</span>
                </div>

                <div style={{ background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-subtle)', borderRadius: '10px', padding: '0.85rem 1.15rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: '600' }}>Total Money Recv / Borrowed</div>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1.25rem', fontWeight: '800', color: 'var(--accent-danger)', marginTop: '0.15rem' }}>
                      ₹{activeContactStatement.totalBorrowed.toFixed(2)}
                    </div>
                  </div>
                  <span style={{ fontSize: '1.5rem' }}>🔴</span>
                </div>

                <div style={{ background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-subtle)', borderRadius: '10px', padding: '0.85rem 1.15rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: '600' }}>Current Running Net Balance</div>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1.25rem', fontWeight: '800', color: activeContactStatement.netReceivable >= 0 ? 'var(--accent-emerald)' : 'var(--accent-danger)', marginTop: '0.15rem' }}>
                      {activeContactStatement.netReceivable >= 0 ? '+' : '-'}₹{Math.abs(activeContactStatement.netReceivable).toFixed(2)}
                    </div>
                  </div>
                  <span style={{ fontSize: '1.5rem' }}>🏦</span>
                </div>
              </div>

              {/* Active Filters Status Bar */}
              {(dateRangeFilter !== 'ALL_TIME' || eventTypeFilter !== 'ALL_TYPES') && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1rem', background: 'var(--bg-surface-elevated)', padding: '0.45rem 0.85rem', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
                  <span style={{ fontSize: '0.8rem', color: 'var(--accent-amber)', fontWeight: '700' }}>⚡ Active Statement Filters:</span>
                  {dateRangeFilter !== 'ALL_TIME' && <Badge variant="amber">📅 {dateRangeFilter.replace('_', ' ')}</Badge>}
                  {eventTypeFilter !== 'ALL_TYPES' && <Badge variant="emerald">🏷️ {eventTypeFilter === 'PAYMENT_OUT' ? 'PAYMENT OUT' : 'PAYMENT IN'}</Badge>}
                  <button
                    onClick={() => { setDateRangeFilter('ALL_TIME'); setEventTypeFilter('ALL_TYPES'); }}
                    style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '0.75rem', cursor: 'pointer', textDecoration: 'underline', marginLeft: 'auto' }}
                  >
                    Clear Filters ✕
                  </button>
                </div>
              )}

              {/* Decoupled Bank Statement DataTable with Filtered Data */}
              <DataTable
                exportFilename={`Bank_Statement_${activeContactStatement.person.name.replace(/\s+/g, '_')}`}
                showSearch={false}
                headers={[
                  'Transaction Direction',
                  '📅 Date',
                  'Amount (₹)',
                  '🏦 Running Net Balance (₹)',
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
                data={filteredStatementDebts}
                loading={loading}
                emptyMessage={`No statement records found for ${activeContactStatement.person.name} matching selected filters.`}
                onRowClick={(row) => openEditModal(row)}
                onEditSelected={(row) => openEditModal(row)}
                onDeleteSelected={(selectedIds) => requestBatchDelete(selectedIds)}
              />
            </div>
          )}

        </div>
      )}

      {/* FULL DETAIL INSPECTION & EDIT/DELETE MODAL */}
      <AnimatePresence>
        {editingRecord && (
          <div className="modal-overlay">
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="modal-dialog debt-modal">
              <div className="modal-header">
                <div>
                  <h3 className="modal-title">🏦 Ledger Transaction Inspection & Edit</h3>
                  <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
                    Record #{editingRecord.id} • Contact: {editingRecord.personName}
                  </p>
                </div>
                <button type="button" onClick={() => setEditingRecord(null)} className="modal-close-btn">✕</button>
              </div>

              <form onSubmit={handleEditSubmit} className="modal-form">
                
                {/* Metric Inspection Banner */}
                <div className="form-grid-2" style={{ marginBottom: '0.5rem' }}>
                  <div style={{ background: 'var(--bg-surface)', padding: '0.85rem 1rem', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Recorded Timestamp</div>
                    <div style={{ fontSize: '0.9rem', fontWeight: '700', color: 'var(--text-heading)', marginTop: '0.15rem' }}>{editingRecord.givenDate}</div>
                  </div>
                  <div style={{ background: 'var(--bg-surface)', padding: '0.85rem 1rem', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Resulting Net Running Balance</div>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1rem', fontWeight: '800', color: editingRecord.runningBalance >= 0 ? 'var(--accent-emerald)' : 'var(--accent-danger)', marginTop: '0.15rem' }}>
                      {editingRecord.runningBalance >= 0 ? '+' : '-'}₹{Math.abs(editingRecord.runningBalance || 0).toFixed(2)}
                    </div>
                  </div>
                </div>

                <div className="form-grid-2">
                  <div>
                    <label className="form-label">Transaction Amount (₹)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={editAmount}
                      onChange={e => setEditAmount(e.target.value)}
                      className="form-input"
                      style={{ fontFamily: 'var(--font-mono)' }}
                      required
                    />
                  </div>

                  <div>
                    <label className="form-label">Direction</label>
                    <select value={editType} onChange={e => setEditType(e.target.value)} className="form-select">
                      <option value="GIVE_LOAN">🟢 Payment Out (Money Sent / Lent)</option>
                      <option value="TAKE_LOAN">💵 Payment In (Money Recv / Borrowed)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="form-label">📝 Notes & Reference (Payment Method, Reason)</label>
                  <input
                    type="text"
                    value={editNotes}
                    onChange={e => setEditNotes(e.target.value)}
                    className="form-input"
                  />
                </div>

                <div className="form-actions" style={{ justifyContent: 'space-between', marginTop: '1rem' }}>
                  <Button type="button" variant="danger" onClick={() => requestSingleDelete(editingRecord.id)}>
                    🗑️ Delete Record
                  </Button>

                  <div style={{ display: 'flex', gap: '0.75rem' }}>
                    <Button type="button" variant="secondary" onClick={() => setEditingRecord(null)}>Close</Button>
                    <Button type="submit" variant="emerald">✏️ Save & Update Entry →</Button>
                  </div>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* CREATE CUSTOM CATEGORY MODAL (COMPACT 500PX MODAL DIALOG) */}
      <AnimatePresence>
        {isCategoryModalOpen && (
          <div className="modal-overlay">
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="modal-dialog category-modal">
              <div className="modal-header">
                <div>
                  <h3 className="modal-title">➕ Create Custom PostgreSQL Category</h3>
                  <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>Persists custom category & monthly target budget in database.</p>
                </div>
                <button type="button" onClick={() => setIsCategoryModalOpen(false)} className="modal-close-btn">✕</button>
              </div>

              <form onSubmit={handleCreateCategorySubmit} className="modal-form">
                <div>
                  <label className="form-label">Category Name</label>
                  <input type="text" placeholder="e.g. Gym & Fitness, Cloud Servers" value={newCatName} onChange={e => setNewCatName(e.target.value)} className="form-input" required />
                </div>

                <div className="form-grid-2">
                  <div>
                    <label className="form-label">Icon Emoji</label>
                    <input type="text" placeholder="🏋️" value={newCatIcon} onChange={e => setNewCatIcon(e.target.value)} className="form-input" />
                  </div>

                  <div>
                    <label className="form-label">Monthly Target Budget (₹)</label>
                    <input type="number" placeholder="10000" value={newCatBudget} onChange={e => setNewCatBudget(e.target.value)} className="form-input" style={{ fontFamily: 'var(--font-mono)' }} required />
                  </div>
                </div>

                <div className="form-actions">
                  <Button variant="secondary" type="button" onClick={() => setIsCategoryModalOpen(false)}>Cancel</Button>
                  <Button type="submit" variant="emerald">Create Category in DB →</Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* REUSABLE CONFIRMATION MODAL */}
      <ConfirmModal
        isOpen={confirmConfig.isOpen}
        title={confirmConfig.title}
        message={confirmConfig.message}
        confirmText="Delete Record"
        variant="danger"
        onConfirm={confirmConfig.onConfirm}
        onClose={() => setConfirmConfig(prev => ({ ...prev, isOpen: false }))}
      />

      {/* TRANSACTIONS TAB */}
      {activeTab === 'transactions' && (
        <div className="finance-data-card">
          <div style={{ marginBottom: '1.5rem' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: '700', color: 'var(--text-heading)' }}>Income & Expense History</h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Click any row to inspect details or manage records.</p>
          </div>

          <DataTable
            headers={['Note & Context', 'Category', 'Amount (₹)', 'Type']}
            keys={['description', 'category', 'amount', 'transactionType']}
            renderers={transactionRenderers}
            data={transactions}
            loading={loading}
            emptyMessage="No transaction history recorded yet."
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
                <Button variant="secondary" type="button" onClick={() => setIsWalletModalOpen(true)} style={{ fontSize: '0.8rem' }}>
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
                    ₹{Number(w.balance).toFixed(2)}
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
                <button type="button" onClick={() => setIsDebtModalOpen(false)} className="modal-close-btn">✕</button>
              </div>

              <form onSubmit={handleDebtSubmit} className="modal-form">
                <div>
                  <label className="form-label">Contact Person Name</label>
                  <input type="text" placeholder="Tariq Ahmad" value={personName} onChange={e => setPersonName(e.target.value)} className="form-input" required />
                </div>

                <div className="form-grid-2">
                  <div>
                    <label className="form-label">Amount (₹)</label>
                    <input type="number" step="0.01" placeholder="1000.00" value={debtAmount} onChange={e => setDebtAmount(e.target.value)} className="form-input" style={{ fontFamily: 'var(--font-mono)' }} required />
                  </div>

                  <div>
                    <label className="form-label">Direction</label>
                    <select value={debtType} onChange={e => setDebtType(e.target.value)} className="form-select">
                      <option value="GIVE_LOAN">🟢 Payment Out (Money Sent / Lent)</option>
                      <option value="TAKE_LOAN">💵 Payment In (Money Recv / Borrowed)</option>
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
                  <Button variant="secondary" type="button" onClick={() => setIsDebtModalOpen(false)}>Cancel</Button>
                  <Button type="submit" variant="emerald">Append Bank Ledger Entry →</Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* CREATE TRANSACTION MODAL WITH LIVE DB CATEGORIES */}
      <AnimatePresence>
        {isTxModalOpen && (
          <div className="modal-overlay">
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="modal-dialog tx-modal">
              <div className="modal-header">
                <div>
                  <h3 className="modal-title">💸 Record Financial Transaction</h3>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>Saves directly to PostgreSQL naqashly_finance_db in INR (₹)</p>
                </div>
                <button type="button" onClick={() => setIsTxModalOpen(false)} className="modal-close-btn">✕</button>
              </div>

              <form onSubmit={handleTxSubmit} className="modal-form">
                <div>
                  <label className="form-label">Type</label>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    {TRANSACTION_TYPES.map(type => {
                      const isSelected = txType === type.value;
                      return (
                        <button
                          key={type.value}
                          type="button"
                          onClick={() => setTxType(type.value)}
                          style={{
                            flex: 1,
                            padding: '0.65rem',
                            borderRadius: '8px',
                            border: isSelected ? 'none' : '1px solid var(--border-subtle)',
                            background: isSelected ? (type.value === 'EXPENSE' ? 'var(--accent-danger)' : 'var(--accent-emerald)') : 'var(--bg-surface-elevated)',
                            color: isSelected ? '#FFFFFF' : 'var(--text-heading)',
                            fontWeight: '700',
                            fontSize: '0.85rem',
                            cursor: 'pointer'
                          }}
                        >
                          {type.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="form-grid-2">
                  <div>
                    <label className="form-label">Amount (₹)</label>
                    <input type="number" step="0.01" placeholder="0.00" value={txAmount} onChange={e => setTxAmount(e.target.value)} className="form-input" style={{ fontFamily: 'var(--font-mono)' }} required />
                  </div>

                  <div>
                    <label className="form-label">Category (PostgreSQL Live)</label>
                    <select value={category} onChange={e => setCategory(e.target.value)} className="form-select">
                      {categories.map(cat => (
                        <option key={cat.id} value={cat.name}>{cat.icon} {cat.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="form-label">📝 Note & Context (Why, What, With Whom)</label>
                  <input type="text" placeholder="e.g., Client lunch at Cafe with Tariq & Bilal" value={noteContent} onChange={e => setNoteContent(e.target.value)} className="form-input" />
                </div>

                {/* Intelligent Live Over-Budget Warning Banner inside Modal in INR */}
                {liveFormOverBudgetWarning && (
                  <motion.div
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    style={{
                      background: 'rgba(245, 158, 11, 0.12)',
                      border: '1px solid rgba(245, 158, 11, 0.4)',
                      borderRadius: '8px',
                      padding: '0.75rem 1rem',
                      color: 'var(--accent-amber)',
                      fontSize: '0.82rem',
                      fontWeight: '600'
                    }}
                  >
                    ⚠️ Note: Logging this expense of ₹{parseFloat(txAmount).toFixed(2)} will exceed your monthly {liveFormOverBudgetWarning.category} budget limit by ₹{liveFormOverBudgetWarning.overBy.toFixed(2)}!
                  </motion.div>
                )}

                <div className="form-actions">
                  <Button variant="secondary" type="button" onClick={() => setIsTxModalOpen(false)}>Cancel</Button>
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
                <button type="button" onClick={() => setIsWalletModalOpen(false)} className="modal-close-btn">✕</button>
              </div>

              <form onSubmit={handleWalletSubmit} className="modal-form">
                <div>
                  <label className="form-label">Wallet Name</label>
                  <input type="text" placeholder="e.g. Bank Account, Cash Wallet, Crypto Vault" value={walletName} onChange={e => setWalletName(e.target.value)} className="form-input" required />
                </div>

                <div>
                  <label className="form-label">Initial Balance (₹)</label>
                  <input type="number" placeholder="0.00" value={initialBalance} onChange={e => setInitialBalance(e.target.value)} className="form-input" />
                </div>

                <div className="form-actions">
                  <Button variant="secondary" type="button" onClick={() => setIsWalletModalOpen(false)}>Cancel</Button>
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
