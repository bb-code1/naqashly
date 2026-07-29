import React, { useState, useMemo } from 'react';
import { Badge } from '../../components/ui/Badge';
import { DataTable } from '../../components/ui/DataTable';
import { useFinance } from '../../hooks/useFinance';
import { TRANSACTION_TYPES } from '../../constants/financeConstants';
import { FinanceOverview } from './components/FinanceOverview';
import { InterpersonalLedger } from './components/InterpersonalLedger';
import { FinanceModals } from './components/FinanceModals';
import './FinanceModule.css';

/**
 * Bank-Grade Double-Entry Interpersonal Ledger Suite, Spending Analytics & PostgreSQL Category Budget Engine.
 * Refactored & Modularized structure.
 * 
 * @author Barkat Bashir
 * @version 36.0.0
 */
export const FinanceModule = ({ activeSubTab, onSelectSubTab }) => {
  const {
    transactions,
    categories,
    contactStatements,
    loading,
    netCreditSum,
    netDebitSum,
    totalInflow,
    totalOutflow,
    savingsRate,
    categoryBreakdown,
    budgetHealthList,
    totalOverallBudget,
    updateCategoryBudget,
    addCategory,
    deleteCategory,
    deleteDebt,
    addDebt,
    updateDebt,
    addTransaction,
    updateTransaction,
    deleteTransaction,
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

  // Transaction Edit / Delete Modal State
  const [editingTx, setEditingTx] = useState(null);
  const [editTxAmount, setEditTxAmount] = useState('');
  const [editTxType, setEditTxType] = useState('EXPENSE');
  const [editTxCategory, setEditTxCategory] = useState('General');
  const [editTxDescription, setEditTxDescription] = useState('');

  // Date Helper for Today ISO
  const getTodayISO = () => new Date().toISOString().split('T')[0];

  // Form Inputs
  const [personName, setPersonName] = useState('');
  const [personPhone, setPersonPhone] = useState('');
  const [personAddress, setPersonAddress] = useState('');
  const [selectedExistingPerson, setSelectedExistingPerson] = useState(null);
  const [debtAmount, setDebtAmount] = useState('');
  const [debtType, setDebtType] = useState('GIVE_LOAN');
  const [debtNotes, setDebtNotes] = useState('');

  const [txAmount, setTxAmount] = useState('');
  const [txType, setTxType] = useState('EXPENSE');
  const [category, setCategory] = useState('');
  const [noteContent, setNoteContent] = useState('');

  const handleNameBlur = () => {
    const nameVal = personName.trim();
    if (!nameVal) return;
    const matched = persons?.find(p => p.name?.toLowerCase() === nameVal.toLowerCase());
    if (matched) {
      setSelectedExistingPerson(matched);
      setPersonName(matched.name);
      setPersonPhone(matched.phone || '');
      setPersonAddress(matched.address || '');
    } else {
      setSelectedExistingPerson(null);
    }
  };

  // Submit Handlers
  const handleDebtSubmit = async (e, customPersonName = null) => {
    if (e && e.preventDefault) e.preventDefault();
    let pName = (customPersonName || personName || '').trim();
    if (!pName) return;

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
      dueDate: getTodayISO(),
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
    setSelectedPersonId(null);
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

  const handleEditTxSubmit = async (e) => {
    e.preventDefault();
    if (!editingTx) return;
    await updateTransaction(editingTx.id, {
      amount: editTxAmount,
      txType: editTxType,
      category: editTxCategory,
      noteContent: editTxDescription
    });
    setEditingTx(null);
  };

  const requestTxDelete = (id) => {
    setConfirmConfig({
      isOpen: true,
      title: '🗑️ Delete Financial Transaction',
      message: `Are you sure you want to delete transaction entry #${id}? This will reverse its balance adjustment on the corresponding wallet.`,
      onConfirm: async () => {
        await deleteTransaction(id);
        setEditingTx(null);
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
    description: (val) => <span className="finance-tx-desc">{val || 'General Log'}</span>,
    category: (val) => <span className="finance-tx-cat">{val}</span>,
    amount: (val, row) => {
      const isIncome = row?.transactionType === 'INCOME' || row?.type === 'INCOME';
      return (
        <span className={`finance-tx-amount ${isIncome ? 'income' : 'expense'}`}>
          {isIncome ? '+' : '-'}₹{Number(val || 0).toFixed(2)}
        </span>
      );
    },
    transactionType: (val) => <Badge variant={val === 'INCOME' ? 'emerald' : 'amber'}>{val || 'EXPENSE'}</Badge>,
    actions: (val, row) => (
      <div className="finance-tx-actions">
        <button
          type="button"
          onClick={() => {
            setEditingTx(row);
            setEditTxAmount(row.amount);
            setEditTxType(row.transactionType || 'EXPENSE');
            setEditTxCategory(row.category || 'General');
            setEditTxDescription(row.description || '');
          }}
          className="finance-tx-action-btn edit"
          title="Edit Transaction"
        >
          ✏️
        </button>
        <button
          type="button"
          onClick={() => requestTxDelete(row.id)}
          className="finance-tx-action-btn delete"
          title="Delete Transaction"
        >
          ✕
        </button>
      </div>
    )
  };

  return (
    <div className="finance-container">
      
      {/* 1. EXECUTIVE METRIC HEADER IN INR (₹) */}
      <div className="finance-metric-grid">
        <div className="metric-card-base metric-card-networth">
          <div className="metric-label-row">
            <span className="metric-title">Net Cash Balance</span>
            <Badge variant={totalInflow - totalOutflow >= 0 ? 'emerald' : 'danger'}>Indian Rupee (INR)</Badge>
          </div>
          <div className={`metric-value ${totalInflow - totalOutflow >= 0 ? 'value-emerald' : 'value-danger'}`}>
            ₹{(totalInflow - totalOutflow).toFixed(2)}
          </div>
          <div className="metric-subtitle">Total Inflow minus Total Outflow</div>
        </div>

        <div className="metric-card-base metric-card-credit">
          <div className="metric-title">Net Lent Out</div>
          <div className="metric-value value-emerald">+₹{netCreditSum.toFixed(2)}</div>
          <div className="finance-metric-subtext credit">✓ Money Owed to You</div>
        </div>

        <div className="metric-card-base metric-card-debit">
          <div className="metric-title">Net Borrowed</div>
          <div className="metric-value value-danger">-₹{netDebitSum.toFixed(2)}</div>
          <div className="finance-metric-subtext debit">⚠️ Money You Owe</div>
        </div>
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
            onClick={() => {
              setActiveTab(tab.key);
              if (tab.key === 'overview') {
                setSelectedPersonId(null);
              }
            }}
            className={`subtab-btn ${activeTab === tab.key ? 'active' : ''}`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* 3. SUB-TAB CONTENTS */}

      {/* OVERVIEW & CASHFLOW DASHBOARD */}
      {activeTab === 'overview' && (
        <FinanceOverview
          categories={categories}
          transactions={transactions}
          totalOutflow={totalOutflow}
          totalOverallBudget={totalOverallBudget}
          savingsRate={savingsRate}
          budgetHealthList={budgetHealthList}
          categoryBreakdown={categoryBreakdown}
          editingCatId={editingCatId}
          setEditingCatId={setEditingCatId}
          newBudgetVal={newBudgetVal}
          setNewBudgetVal={setNewBudgetVal}
          deleteCategory={deleteCategory}
          handleSaveBudgetLimit={handleSaveBudgetLimit}
          setIsCategoryModalOpen={setIsCategoryModalOpen}
          setActiveTab={setActiveTab}
          txAmount={txAmount}
          setTxAmount={setTxAmount}
          txType={txType}
          setTxType={setTxType}
          category={category}
          setCategory={setCategory}
          noteContent={noteContent}
          setNoteContent={setNoteContent}
          handleTxSubmit={handleTxSubmit}
        />
      )}

      {/* TRANSACTIONS TAB */}
      {activeTab === 'transactions' && (
        <div className="finance-data-card">
          <div className="finance-data-card-header">
            <h3 className="finance-data-card-title">Income & Expense History</h3>
            <p className="finance-data-card-subtitle">Click any row to inspect details or manage records.</p>
          </div>

          <DataTable
            headers={['Note & Context', 'Category', 'Amount (₹)', 'Type', 'Actions']}
            keys={['description', 'category', 'amount', 'transactionType', 'actions']}
            renderers={transactionRenderers}
            data={transactions}
            loading={loading}
            emptyMessage="No transaction history recorded yet."
          />
        </div>
      )}

      {/* FRIENDS & PEER BALANCES TAB */}
      {activeTab === 'contacts' && (
        <InterpersonalLedger
          contactStatements={contactStatements}
          contactSearch={personName}
          setContactSearch={setPersonName}
          contactPage={1}
          setContactPage={() => {}}
          selectedPersonId={selectedPersonId}
          setSelectedPersonId={setSelectedPersonId}
          personName={personName}
          setPersonName={setPersonName}
          personPhone={personPhone}
          setPersonPhone={setPersonPhone}
          personAddress={personAddress}
          setPersonAddress={setPersonAddress}
          selectedExistingPerson={selectedExistingPerson}
          setSelectedExistingPerson={setSelectedExistingPerson}
          debtAmount={debtAmount}
          setDebtAmount={setDebtAmount}
          debtType={debtType}
          setDebtType={setDebtType}
          debtNotes={debtNotes}
          setDebtNotes={setDebtNotes}
          handleDebtSubmit={handleDebtSubmit}
          handleNameBlur={handleNameBlur}
          requestSingleDelete={requestSingleDelete}
          setEditingRecord={setEditingRecord}
          setEditAmount={setEditAmount}
          setEditType={setEditType}
          setEditNotes={setEditNotes}
          exportStatementToCSV={exportStatementToCSV}
        />
      )}

      {/* 4. ALL MODAL POPUPS */}
      <FinanceModals
        editingTx={editingTx}
        setEditingTx={setEditingTx}
        editTxAmount={editTxAmount}
        setEditTxAmount={setEditTxAmount}
        editTxType={editTxType}
        setEditTxType={setEditTxType}
        editTxCategory={editTxCategory}
        setEditTxCategory={setEditTxCategory}
        editTxDescription={editTxDescription}
        setEditTxDescription={setEditTxDescription}
        categories={categories}
        requestTxDelete={requestTxDelete}
        handleEditTxSubmit={handleEditTxSubmit}

        isCategoryModalOpen={isCategoryModalOpen}
        setIsCategoryModalOpen={setIsCategoryModalOpen}
        newCatName={newCatName}
        setNewCatName={setNewCatName}
        newCatIcon={newCatIcon}
        setNewCatIcon={setNewCatIcon}
        newCatBudget={newCatBudget}
        setNewCatBudget={setNewCatBudget}
        newCatType={newCatType}
        setNewCatType={setNewCatType}
        newCatColor={newCatColor}
        setNewCatColor={setNewCatColor}
        handleCreateCategorySubmit={handleCreateCategorySubmit}

        confirmConfig={confirmConfig}
        setConfirmConfig={setConfirmConfig}

        isTxModalOpen={isTxModalOpen}
        setIsTxModalOpen={setIsTxModalOpen}
        txType={txType}
        setTxType={setTxType}
        txAmount={txAmount}
        setTxAmount={setTxAmount}
        category={category}
        setCategory={setCategory}
        noteContent={noteContent}
        setNoteContent={setNoteContent}
        handleTxSubmit={handleTxSubmit}
        liveFormOverBudgetWarning={liveFormOverBudgetWarning}

        editingRecord={editingRecord}
        setEditingRecord={setEditingRecord}
        editAmount={editAmount}
        setEditAmount={setEditAmount}
        editType={editType}
        setEditType={setEditType}
        editNotes={editNotes}
        setEditNotes={setEditNotes}
        requestSingleDelete={requestSingleDelete}
        handleEditSubmit={handleEditSubmit}
      />

    </div>
  );
};
