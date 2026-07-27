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
    addTransaction,
    persons
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

  // Date Helper for Today ISO
  const getTodayISO = () => new Date().toISOString().split('T')[0];

  // Form Inputs
  const [personName, setPersonName] = useState('');
  const [personPhone, setPersonPhone] = useState('');
  const [personAddress, setPersonAddress] = useState('');
  const [selectedExistingPerson, setSelectedExistingPerson] = useState(null);
  const [debtAmount, setDebtAmount] = useState('');
  const [debtType, setDebtType] = useState('GIVE_LOAN');
  const [dueDate, setDueDate] = useState(getTodayISO);
  const [debtCategory, setDebtCategory] = useState('SHARED_EXPENSE');
  const [debtNotes, setDebtNotes] = useState('');
  const [contactSearch, setContactSearch] = useState('');
  const [contactPage, setContactPage] = useState(1);

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
  const handleDebtSubmit = async (e, customPersonName = null) => {
    if (e && e.preventDefault) e.preventDefault();
    let pName = (customPersonName || personName || '').trim();
    if (!pName) return;

    // Case insensitivity harmonizer (if no explicit person selected)
    let matchedPerson = selectedExistingPerson;
    if (!matchedPerson) {
      matchedPerson = persons.find(p => p.name?.toLowerCase() === pName.toLowerCase());
    }

    if (matchedPerson) {
      pName = matchedPerson.name;
    } else {
      // Auto Title Case new name
      pName = pName.split(/\s+/).map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');
    }

    await addDebt({
      personName: pName,
      amount: debtAmount || '0',
      debtType: debtType || 'GIVE_LOAN',
      dueDate: dueDate || getTodayISO(),
      debtCategory: debtType === 'GIVE_LOAN' ? 'LENT_OUT' : 'BORROWED',
      debtNotes: debtNotes || 'Direct entry',
      phone: personPhone || null,
      address: personAddress || null,
      personId: matchedPerson?.id || null
    });
    setDebtAmount('');
    setDebtNotes('');
    setPersonName('');
    setPersonPhone('');
    setPersonAddress('');
    setSelectedExistingPerson(null);
    setIsDebtModalOpen(false);
    setContactPage(1); // Reset page to 1 so the newly added contact is visible
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
      title: '🗑️ Delete Debt/Loan Entry',
      message: `Are you sure you want to delete debt/loan entry #${id}? This will update the contact's running net balance statement.`,
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
      message: `Are you sure you want to delete ${selectedIds.length} selected debt/loan entries at once? This action cannot be undone.`,
      onConfirm: async () => {
        await batchDeleteDebts(selectedIds);
      }
    });
  };

  const exportStatementToCSV = (contactStatement) => {
    if (!contactStatement) return;
    const { person, debts: statementDebts, netReceivable } = contactStatement;
    let csvContent = "\uFEFF";
    csvContent += `"Date","Paid By","Amount (INR)","Notes/Reference"\n`;
    statementDebts.forEach(d => {
      const isLent = d.debtType === 'GIVE_LOAN' || d.debtType === 'MAKE_PAYMENT' || d.debtType === 'CREDIT';
      const paidBy = isLent ? 'You' : person.name;
      const amountVal = `${isLent ? '+' : '-'}₹${Number(d.amount).toFixed(2)}`;
      const noteStr = (d.cleanNotes || d.notes || '').replace(/"/g, '""');
      const dateStr = d.givenDate || d.createdAt?.split('T')[0] || '';
      csvContent += `"${dateStr}","${paidBy}","${amountVal}","${noteStr}"\n`;
    });
    const netText = netReceivable >= 0 ? `${person.name} owes You` : `You owe ${person.name}`;
    const netVal = `₹${Math.abs(netReceivable).toFixed(2)}`;
    csvContent += `\n,,,"Summary: ${netText} (${netVal})"\n`;
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `Statement_${person.name.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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
            <span className="metric-title">Net Cash Balance</span>
            <Badge variant="amber">PostgreSQL Live (INR)</Badge>
          </div>
          <div className="metric-value value-amber">₹{(totalInflow - totalOutflow).toFixed(2)}</div>
          <div className="metric-subtitle">Total Inflow minus Total Outflow</div>
        </motion.div>

        <motion.div whileHover={{ y: -3 }} className="metric-card-base metric-card-credit">
          <div className="metric-title">Net Lent Out</div>
          <div className="metric-value value-emerald">+₹{netCreditSum.toFixed(2)}</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--accent-emerald)', fontWeight: '600' }}>✓ Money Owed to You</div>
        </motion.div>

        <motion.div whileHover={{ y: -3 }} className="metric-card-base metric-card-debit">
          <div className="metric-title">Net Borrowed</div>
          <div className="metric-value value-danger">-₹{netDebitSum.toFixed(2)}</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--accent-danger)', fontWeight: '600' }}>⚠️ Money You Owe</div>
        </motion.div>
      </div>

      {/* 2. SUB-TABS BAR */}
      <div className="finance-subtab-bar">
        {[
          { key: 'overview', label: '📊 Overview' },
          { key: 'transactions', label: '📑 Transactions' },
          { key: 'contacts', label: '👥 Friends & Peer Balances' }
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

      {/* OVERVIEW & CASHFLOW DASHBOARD */}
      {activeTab === 'overview' && (
        <div className="finances-dashboard-grid">
          {/* LEFT COLUMN: CATEGORY BUDGET ALLOCATION */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

            {/* Target Category Budget Allocations */}
            <div className="finance-data-card" style={{ padding: '1.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <div>
                  <h4 style={{ fontSize: '0.95rem', fontWeight: '800', color: 'var(--text-heading)', margin: 0 }}>
                    🎯 Monthly Category Budgets
                  </h4>
                  <p style={{ fontSize: '0.74rem', color: 'var(--text-muted)', margin: '0.1rem 0 0 0' }}>
                    Spending limits and PostgreSQL target allocations
                  </p>
                </div>
                <Button variant="emerald" type="button" onClick={() => setIsCategoryModalOpen(true)} style={{ fontSize: '0.74rem', padding: '0.35rem 0.65rem' }}>
                  + Add Category
                </Button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                {budgetHealthList.map((item) => {
                  const isEditingThis = editingCatId === item.id;
                  let barColor = item.color || '#3B82F6';
                  if (item.isOver) barColor = '#EF4444';
                  else if (item.isNear) barColor = '#F59E0B';

                  return (
                    <div
                      key={item.id}
                      style={{
                        background: 'var(--bg-surface)',
                        border: item.isOver ? '1px solid rgba(239, 68, 68, 0.3)' : '1px solid var(--border-subtle)',
                        borderRadius: '12px',
                        padding: '0.85rem 1rem',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '0.45rem'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <span style={{ fontSize: '1.15rem' }}>{item.icon}</span>
                          <span style={{ fontSize: '0.88rem', fontWeight: '800', color: 'var(--text-heading)' }}>
                            {item.category}
                          </span>
                          <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                            (₹{item.spent.toFixed(0)} / ₹{item.limit.toFixed(0)})
                          </span>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          {isEditingThis ? (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                              <input
                                type="number"
                                value={newBudgetVal}
                                onChange={e => setNewBudgetVal(e.target.value)}
                                style={{ width: '60px', padding: '0.15rem 0.35rem', borderRadius: '4px', background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-subtle)', color: 'var(--text-heading)', fontSize: '0.78rem' }}
                              />
                              <button onClick={() => handleSaveBudgetLimit(item.id)} style={{ padding: '0.15rem 0.35rem', background: '#10B981', border: 'none', color: '#FFF', borderRadius: '4px', fontSize: '0.7rem', fontWeight: '700', cursor: 'pointer' }}>
                                Save
                              </button>
                            </div>
                          ) : (
                            <button onClick={() => { setEditingCatId(item.id); setNewBudgetVal(item.limit); }} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '0.74rem', cursor: 'pointer' }}>
                              ✏️ Limit
                            </button>
                          )}
                          <button onClick={() => deleteCategory(item.id)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '0.74rem', cursor: 'pointer' }}>
                            ✕
                          </button>
                        </div>
                      </div>

                      {/* Visual budget fill bar */}
                      <div style={{ width: '100%', height: '6px', background: 'var(--bg-surface-elevated)', borderRadius: '3px', overflow: 'hidden' }}>
                        <div style={{ width: `${Math.min(100, item.percentage)}%`, height: '100%', background: barColor }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>

          {/* RIGHT COLUMN: QUICK-LOG, CIRCULAR BUDGET GAUGE, ADVISORY BANNER & RECENT LISTS */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

            {/* Twin Panel Grid: Quick-Log (left-ish) & Circular Gauge (right-ish) */}
            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '1rem' }}>
              
              {/* Quick-Log Card */}
              <form onSubmit={handleTxSubmit} className="quick-log-card" style={{ gap: '0.75rem', padding: '1.25rem' }}>
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
              <div className="radial-gauge-container" style={{ padding: '1.25rem' }}>
                <h4 style={{ fontSize: '0.8rem', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '0.65rem' }}>
                  Monthly Budget
                </h4>
                
                {/* SVG Radial progress ring */}
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
            </div>

            {/* Advisory Nudges Glassmorphic Banner */}
            <div className="advisory-nudges-banner">
              <span style={{ fontSize: '1.4rem' }}>💡</span>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                <strong style={{ fontSize: '0.85rem', color: 'var(--text-heading)' }}>Financial Insight</strong>
                <p style={{ fontSize: '0.76rem', color: 'var(--text-muted)', margin: 0, lineHeight: '1.4' }}>
                  {totalOverallBudget > 0 && (totalOutflow / totalOverallBudget) > 0.85 ? (
                    <span style={{ color: 'var(--accent-amber)' }}>⚠️ Warning: You have utilized {((totalOutflow / totalOverallBudget)*100).toFixed(0)}% of your overall monthly target. Slow down expenses to stay on track.</span>
                  ) : savingsRate > 40 ? (
                    <span>🌟 Outstanding work! Your current savings rate is <strong>{savingsRate.toFixed(0)}%</strong>. You are accumulating capital efficiently this month.</span>
                  ) : (
                    <span>Liquid Net Worth is currently synced across {wallets.length} active multi-wallet hubs. Try logging entries inline to keep records up-to-date!</span>
                  )}
                </p>
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
      )}



      {/* FRIENDS & PEER BALANCES TAB (SPLIT SCREEN LAYOUT) */}
      {activeTab === 'contacts' && (
        <div className="debt-workspace-grid">
          
          {/* LEFT SIDEBAR: CONTACT LIST & CREATE TRIGGER */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div className="finance-data-card" style={{ padding: '1.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h4 style={{ fontSize: '0.92rem', fontWeight: '900', color: 'var(--text-heading)', margin: 0 }}>
                  👥 Accounts Directory
                </h4>
                <Button
                  type="button"
                  variant={selectedPersonId === 'NEW_DEBT' || !selectedPersonId ? 'emerald' : 'outline'}
                  onClick={() => setSelectedPersonId('NEW_DEBT')}
                  style={{ fontSize: '0.74rem', padding: '0.35rem 0.65rem' }}
                >
                  ➕ New Record
                </Button>
              </div>

              {/* Search Box */}
              <div style={{ marginBottom: '1rem' }}>
                <input
                  type="text"
                  placeholder="🔍 Search contact by name..."
                  value={contactSearch}
                  onChange={e => {
                    setContactSearch(e.target.value);
                    setContactPage(1);
                  }}
                  style={{ width: '100%', boxSizing: 'border-box', padding: '0.45rem 0.75rem', borderRadius: '8px', border: '1px solid var(--border-subtle)', background: 'var(--bg-surface)', color: 'var(--text-heading)', fontSize: '0.8rem' }}
                />
              </div>

              {(() => {
                const filteredContacts = contactStatements.filter(cs =>
                  cs.person.name?.toLowerCase().includes(contactSearch.toLowerCase())
                );
                const itemsPerPage = 5;
                const totalPages = Math.max(1, Math.ceil(filteredContacts.length / itemsPerPage));
                const pageContacts = filteredContacts.slice((contactPage - 1) * itemsPerPage, contactPage * itemsPerPage);

                return (
                  <>
                    <div className="debt-contact-list">
                      {pageContacts.length === 0 ? (
                        <div style={{ padding: '2rem 1rem', textShadow: 'none', color: 'var(--text-muted)', fontSize: '0.78rem', textAlign: 'center' }}>
                          No matches found
                        </div>
                      ) : (
                        pageContacts.map(cs => {
                          const isActive = selectedPersonId === cs.person.id;
                          return (
                            <div
                              key={cs.person.id}
                              onClick={() => setSelectedPersonId(cs.person.id)}
                              className={`debt-contact-card ${isActive ? 'active' : ''}`}
                            >
                              <div style={{ display: 'flex', flexDirection: 'column' }}>
                                <strong style={{ fontSize: '0.88rem', color: isActive ? '#fff' : 'var(--text-heading)' }}>
                                  {cs.person.name}
                                </strong>
                                <span style={{ fontSize: '0.7rem', color: isActive ? 'rgba(255,255,255,0.7)' : 'var(--text-muted)', marginTop: '0.15rem' }}>
                                  {cs.debts.length} entries
                                </span>
                              </div>
                              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.88rem', fontWeight: '800', color: isActive ? '#fff' : (cs.netReceivable >= 0 ? 'var(--accent-emerald)' : 'var(--accent-danger)') }}>
                                {cs.netReceivable >= 0 ? '+' : '-'}₹{Math.abs(cs.netReceivable).toFixed(0)}
                              </span>
                            </div>
                          );
                        })
                      )}
                    </div>

                    {/* Pagination Bar */}
                    {totalPages > 1 && (
                      <div className="directory-pagination">
                        <button
                          type="button"
                          className="pagination-btn"
                          disabled={contactPage === 1}
                          onClick={() => setContactPage(prev => Math.max(1, prev - 1))}
                        >
                          ◀ Prev
                        </button>
                        <span className="pagination-info">
                          {contactPage} of {totalPages}
                        </span>
                        <button
                          type="button"
                          className="pagination-btn"
                          disabled={contactPage === totalPages}
                          onClick={() => setContactPage(prev => Math.min(totalPages, prev + 1))}
                        >
                          Next ▶
                        </button>
                      </div>
                    )}
                  </>
                );
              })()}
            </div>
          </div>

          {/* RIGHT PANEL: STATEMENT or CREATE FORM */}
          <div className="finance-data-card" style={{ padding: '1.5rem' }}>
            {(!selectedPersonId || selectedPersonId === 'NEW_DEBT') ? (
              /* NEW INTERPERSONAL TRANSACTION FORM */
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div>
                  <h3 style={{ fontSize: '1.15rem', fontWeight: '900', color: 'var(--text-heading)', margin: 0 }}>
                    ➕ Record New Entry
                  </h3>
                  <p style={{ fontSize: '0.76rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                    Type the name of any person (new or existing) to record an entry.
                  </p>
                </div>

                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleDebtSubmit(e, personName.trim());
                  }}
                  className="modal-form"
                  style={{ gap: '1rem' }}
                >
                  <div className="form-grid-2">
                    <div style={{ position: 'relative' }}>
                      <label className="form-label">Contact Person Name</label>
                      <input
                        type="text"
                        placeholder="e.g. Tariq Ahmad"
                        value={personName}
                        onChange={e => {
                          setPersonName(e.target.value);
                          setSelectedExistingPerson(null);
                        }}
                        className="form-input"
                        required
                      />

                      {selectedExistingPerson && (
                        <div style={{ marginTop: '0.45rem', fontSize: '0.72rem', color: 'var(--accent-emerald)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span>✓ Linked to existing profile: {selectedExistingPerson.name}</span>
                          <button 
                            type="button" 
                            onClick={() => {
                              setSelectedExistingPerson(null);
                              setPersonName('');
                              setPersonPhone('');
                              setPersonAddress('');
                            }}
                            style={{ background: 'none', border: 'none', color: 'var(--accent-danger)', cursor: 'pointer', fontSize: '0.72rem' }}
                          >
                            Clear Selection
                          </button>
                        </div>
                      )}

                      {personName.trim() && !selectedExistingPerson && (() => {
                        const matches = persons.filter(p => p.name?.toLowerCase().includes(personName.toLowerCase()));
                        if (matches.length === 0) return null;
                        return (
                          <div style={{
                            position: 'absolute',
                            top: '100%',
                            left: 0,
                            right: 0,
                            background: 'var(--bg-surface-elevated)',
                            border: '1px solid var(--border-subtle)',
                            borderRadius: '8px',
                            marginTop: '0.45rem',
                            maxHeight: '150px',
                            overflowY: 'auto',
                            padding: '0.25rem',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '0.2rem',
                            zIndex: 10,
                            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
                          }}>
                            <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', padding: '0.2rem 0.4rem', fontWeight: '800' }}>
                              Existing Contacts (Click to link):
                            </div>
                            {matches.map(m => (
                              <button
                                key={m.id}
                                type="button"
                                onClick={() => {
                                  setSelectedExistingPerson(m);
                                  setPersonName(m.name);
                                  setPersonPhone(m.phone || '');
                                  setPersonAddress(m.address || '');
                                }}
                                style={{
                                  background: 'none',
                                  border: 'none',
                                  color: 'var(--text-heading)',
                                  textAlign: 'left',
                                  padding: '0.35rem 0.5rem',
                                  fontSize: '0.76rem',
                                  borderRadius: '6px',
                                  cursor: 'pointer',
                                  display: 'flex',
                                  justifyContent: 'space-between',
                                  alignItems: 'center'
                                }}
                              >
                                <span>👤 <strong>{m.name}</strong> {m.phone ? `(${m.phone})` : ''}</span>
                                <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>{m.address || 'No address'}</span>
                              </button>
                            ))}
                          </div>
                        );
                      })()}
                    </div>

                    <div>
                      <label className="form-label">Transaction Amount (₹)</label>
                      <input
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        value={debtAmount}
                        onChange={e => setDebtAmount(e.target.value)}
                        className="form-input"
                        style={{ fontFamily: 'var(--font-mono)' }}
                        required
                      />
                    </div>
                  </div>

                  <div className="form-grid-2">
                    <div>
                      <label className="form-label">Direction</label>
                      <select value={debtType} onChange={e => setDebtType(e.target.value)} className="form-select">
                        <option value="GIVE_LOAN">🟢 Lent Out (Owed to You)</option>
                        <option value="TAKE_LOAN">📥 Borrowed (You Owe)</option>
                      </select>
                    </div>

                    <div>
                      <label className="form-label">📝 Notes & Details</label>
                      <input
                        type="text"
                        placeholder="e.g. UPI transfer for lunch"
                        value={debtNotes}
                        onChange={e => setDebtNotes(e.target.value)}
                        className="form-input"
                      />
                    </div>
                  </div>

                  <div className="form-grid-2">
                    <div>
                      <label className="form-label">📞 Phone Number (Optional)</label>
                      <input
                        type="tel"
                        placeholder="e.g. +91 99999 99999"
                        value={personPhone}
                        onChange={e => setPersonPhone(e.target.value)}
                        className="form-input"
                        disabled={!!selectedExistingPerson}
                      />
                    </div>

                    <div>
                      <label className="form-label">📍 Address/Location (Optional)</label>
                      <input
                        type="text"
                        placeholder="e.g. Delhi, Sector 5"
                        value={personAddress}
                        onChange={e => setPersonAddress(e.target.value)}
                        className="form-input"
                        disabled={!!selectedExistingPerson}
                      />
                    </div>
                  </div>

                  <div style={{ textAlign: 'right', marginTop: '0.5rem' }}>
                    <Button type="submit" variant="emerald" style={{ fontWeight: '800' }}>
                      + Log Entry
                    </Button>
                  </div>
                </form>
              </div>
            ) : (
              /* DETAILED BANK RUNNING BALANCE STATEMENT VIEW WITH QUICK-LOGGER AND APPLE CARD FEED */
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                
                {/* Statement Header Summary */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.85rem' }}>
                  <div>
                    <h3 style={{ fontSize: '1.15rem', fontWeight: '900', color: 'var(--text-heading)', margin: 0 }}>
                      🤝 Peer Activity Summary: {activeContactStatement.person.name}
                    </h3>
                    <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
                      Net Standing: <strong style={{ color: activeContactStatement.netReceivable >= 0 ? 'var(--accent-emerald)' : 'var(--accent-danger)' }}>
                        {activeContactStatement.netReceivable >= 0 ? 'Receivable' : 'Payable'} of ₹{Math.abs(activeContactStatement.netReceivable).toFixed(2)}
                      </strong>
                    </div>
                    {(activeContactStatement.person.phone || activeContactStatement.person.address) && (
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.25rem', display: 'flex', gap: '0.75rem' }}>
                        {activeContactStatement.person.phone && <span>📞 {activeContactStatement.person.phone}</span>}
                        {activeContactStatement.person.address && <span>📍 {activeContactStatement.person.address}</span>}
                      </div>
                    )}
                  </div>

                  <div style={{ display: 'flex', gap: '0.45rem', alignItems: 'center' }}>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => exportStatementToCSV(activeContactStatement)}
                      style={{ fontSize: '0.74rem', padding: '0.35rem 0.65rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}
                    >
                      📊 Export to Excel
                    </Button>
                    <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', padding: '0.35rem 0.65rem', borderRadius: '8px', textAlign: 'center' }}>
                      <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>Lent Out</div>
                      <div style={{ fontSize: '0.85rem', fontWeight: '800', color: 'var(--accent-emerald)', fontFamily: 'var(--font-mono)' }}>
                        ₹{activeContactStatement.totalLent.toFixed(0)}
                      </div>
                    </div>
                    <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', padding: '0.35rem 0.65rem', borderRadius: '8px', textAlign: 'center' }}>
                      <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>Borrowed</div>
                      <div style={{ fontSize: '0.85rem', fontWeight: '800', color: 'var(--accent-danger)', fontFamily: 'var(--font-mono)' }}>
                        ₹{activeContactStatement.totalBorrowed.toFixed(0)}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Inline Quick Loan Logger Form */}
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleDebtSubmit(e, activeContactStatement.person.name);
                  }}
                  style={{ background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-subtle)', borderRadius: '14px', padding: '0.85rem', display: 'flex', flexWrap: 'wrap', gap: '0.55rem', alignItems: 'center' }}
                >
                  <span style={{ fontSize: '0.78rem', fontWeight: '800', color: 'var(--text-muted)', marginRight: '0.25rem' }}>
                    ⚡ Log Entry for {activeContactStatement.person.name}:
                  </span>

                  <input
                    type="number"
                    step="0.01"
                    placeholder="₹ Amount"
                    value={debtAmount}
                    onChange={e => setDebtAmount(e.target.value)}
                    style={{ width: '90px', padding: '0.4rem 0.6rem', borderRadius: '8px', border: '1px solid var(--border-subtle)', background: 'var(--bg-surface)', color: 'var(--text-heading)', fontSize: '0.78rem', fontFamily: 'var(--font-mono)' }}
                    required
                  />

                  <select
                    value={debtType}
                    onChange={e => setDebtType(e.target.value)}
                    style={{ padding: '0.4rem 0.6rem', borderRadius: '8px', border: '1px solid var(--border-subtle)', background: 'var(--bg-surface)', color: 'var(--text-heading)', fontSize: '0.78rem' }}
                  >
                    <option value="GIVE_LOAN">🟢 Lent Out (He owes me)</option>
                    <option value="TAKE_LOAN">📥 Borrowed (I owe him)</option>
                  </select>

                  <input
                    type="text"
                    placeholder="Note (e.g. Lunch UPI)"
                    value={debtNotes}
                    onChange={e => setDebtNotes(e.target.value)}
                    style={{ flex: 1, minWidth: '120px', padding: '0.4rem 0.6rem', borderRadius: '8px', border: '1px solid var(--border-subtle)', background: 'var(--bg-surface)', color: 'var(--text-heading)', fontSize: '0.78rem' }}
                  />

                  <Button type="submit" variant="emerald" style={{ fontSize: '0.78rem', padding: '0.4rem 0.85rem' }}>
                    + Record
                  </Button>
                </form>

                {/* Timeline Feed in Apple Card list style */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                  <h4 style={{ fontSize: '0.85rem', fontWeight: '800', color: 'var(--text-muted)', margin: '0.25rem 0' }}>
                    📑 Transaction Activity History
                  </h4>

                  {activeContactStatement.debts.length === 0 ? (
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textAlign: 'center', padding: '2rem' }}>
                      No activity events recorded yet. Use the logger above to begin!
                    </div>
                  ) : (
                    <div className="debt-timeline-container" style={{ gap: '0.65rem' }}>
                      {activeContactStatement.debts.map(d => {
                        const isLent = d.debtType === 'GIVE_LOAN' || d.debtType === 'MAKE_PAYMENT' || d.debtType === 'CREDIT';
                        return (
                          <div key={d.id} className="debt-timeline-item">
                            <div style={{ display: 'flex', alignItems: 'center' }}>
                              {/* Left Directional Emoji Badge */}
                              <div className={`transaction-badge ${isLent ? 'sent' : 'received'}`}>
                                {isLent ? '📤' : '📥'}
                              </div>

                              {/* Middle Notes & Timestamp */}
                              <div style={{ display: 'flex', flexDirection: 'column' }}>
                                <span style={{ fontSize: '0.85rem', fontWeight: '800', color: 'var(--text-heading)' }}>
                                  {d.cleanNotes || d.notes || (isLent ? 'Lent cash out' : 'Borrowed cash')}
                                </span>
                                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
                                  {d.givenDate || d.createdAt?.split('T')[0] || 'Today'}
                                </span>
                              </div>
                            </div>

                            {/* Right cash amount and delete button */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                              <span className={`transaction-amount ${isLent ? 'sent' : 'received'}`}>
                                {isLent ? '+' : '-'}₹{Number(d.amount).toFixed(0)}
                              </span>
                              <button
                                type="button"
                                onClick={() => requestSingleDelete(d.id)}
                                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '0.85rem', cursor: 'pointer', padding: '0.2rem', opacity: 0.6 }}
                                title="Delete Entry"
                              >
                                ✕
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

              </div>
            )}
          </div>

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



    </div>
  );
};
