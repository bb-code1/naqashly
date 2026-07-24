import { useState, useEffect, useCallback } from 'react';
import { financeApi } from '../api/financeApi';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';

/**
 * Decoupled Custom React Hook for Naqashly Bank-Grade Double-Entry Interpersonal Ledger, Spending Analytics & PostgreSQL DB Categories.
 * Computes Chronological Running Balances, Category Spending Breakdown, Cashflow Metrics, and Real-Time Budget Health in INR (₹).
 * Supports Flexible Substring / Keyword Category Matching to harmonize legacy logs with PostgreSQL DB categories.
 * 
 * @author Barkat Bashir
 * @version 15.0.0
 */
export const useFinance = () => {
  const { isAuthenticated } = useAuth();
  const { addToast } = useToast();
  const [persons, setPersons] = useState([]);
  const [debts, setDebts] = useState([]);
  const [wallets, setWallets] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedWalletId, setSelectedWalletId] = useState(null);

  // Fetch Live Data from financeApi (Gated behind active authentication)
  const fetchData = useCallback(async () => {
    if (!isAuthenticated) {
      setPersons([]);
      setDebts([]);
      setWallets([]);
      setTransactions([]);
      setCategories([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const [personsRes, debtsRes, walletsRes, txRes, catRes] = await Promise.allSettled([
        financeApi.getPersons(),
        financeApi.getDebts(),
        financeApi.getWallets(),
        financeApi.getTransactions(),
        financeApi.getCategories()
      ]);

      if (personsRes.status === 'fulfilled') setPersons(personsRes.value.data);

      let parsedDebts = [];
      if (debtsRes.status === 'fulfilled') {
        parsedDebts = debtsRes.value.data.map(d => {
          let cleanNotes = d.notes || '';
          let parsedDueDate = '';

          if (cleanNotes.includes('(Due: ')) {
            const dueMatch = cleanNotes.match(/\(Due:\s*([^)]+)\)/);
            if (dueMatch) parsedDueDate = dueMatch[1];
          }

          const totalAmt = Number(d.amount) || 0;
          const formattedGivenDate = d.createdAt
            ? new Date(d.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
            : new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

          return {
            ...d,
            totalAmt,
            givenDate: formattedGivenDate,
            dueDate: parsedDueDate || 'No Due Date',
            cleanNotes: cleanNotes.replace(/\[.*?\]\s*/g, '').replace(/\(Due:\s*[^)]+\)\s*/g, '') || 'General Transaction'
          };
        });
        setDebts(parsedDebts);
      }

      if (walletsRes.status === 'fulfilled') {
        const fetchedWallets = walletsRes.value.data;
        setWallets(fetchedWallets);
        if (fetchedWallets.length > 0) setSelectedWalletId(fetchedWallets[0].id);
      }

      if (txRes.status === 'fulfilled') {
        setTransactions(txRes.value.data);
      }

      if (catRes.status === 'fulfilled') {
        setCategories(catRes.value.data);
      }

    } catch (err) {
      console.error('[useFinance] Error fetching finance data:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Bank Running Balance & Unified Contact Statements Aggregation
  const contactStatements = persons.map(p => {
    const pDebts = debts.filter(d => d.personName.toLowerCase() === p.name.toLowerCase() || d.personId === p.id);

    // Compute Chronological Running Balance (Oldest -> Newest)
    let runningAccumulator = 0;
    const enrichedDebts = pDebts.map(d => {
      const type = d.debtType;
      const amt = d.totalAmt;

      if (type === 'GIVE_LOAN' || type === 'CREDIT') {
        runningAccumulator += amt;
      } else if (type === 'TAKE_LOAN' || type === 'DEBIT') {
        runningAccumulator -= amt;
      } else if (type === 'RECEIVE_PAYMENT') {
        runningAccumulator -= amt;
      } else if (type === 'MAKE_PAYMENT') {
        runningAccumulator += amt;
      }

      return {
        ...d,
        runningBalance: runningAccumulator
      };
    });

    const totalLent = pDebts.filter(d => d.debtType === 'GIVE_LOAN' || d.debtType === 'CREDIT').reduce((acc, d) => acc + d.totalAmt, 0);
    const totalBorrowed = pDebts.filter(d => d.debtType === 'TAKE_LOAN' || d.debtType === 'DEBIT').reduce((acc, d) => acc + d.totalAmt, 0);
    const totalPaymentsReceived = pDebts.filter(d => d.debtType === 'RECEIVE_PAYMENT').reduce((acc, d) => acc + d.totalAmt, 0);
    const totalPaymentsMade = pDebts.filter(d => d.debtType === 'MAKE_PAYMENT').reduce((acc, d) => acc + d.totalAmt, 0);

    const netReceivable = runningAccumulator;

    return {
      person: p,
      totalLent,
      totalBorrowed,
      totalPaymentsReceived,
      totalPaymentsMade,
      netReceivable,
      debts: [...enrichedDebts].reverse()
    };
  });

  // Derived Spending & Cashflow Analytics in INR (₹)
  const totalInflow = transactions.filter(t => t.transactionType === 'INCOME').reduce((acc, t) => acc + Number(t.amount), 0);
  const totalOutflow = transactions.filter(t => t.transactionType === 'EXPENSE').reduce((acc, t) => acc + Number(t.amount), 0);
  const netSavings = totalInflow - totalOutflow;
  const savingsRate = totalInflow > 0 ? Math.max(0, ((netSavings / totalInflow) * 100)) : 0;

  // Category Expense Breakdown
  const expenseTransactions = transactions.filter(t => t.transactionType === 'EXPENSE');
  const categoryTotalsMap = expenseTransactions.reduce((acc, t) => {
    const cat = (t.category || 'General').trim();
    acc[cat] = (acc[cat] || 0) + Number(t.amount);
    return acc;
  }, {});

  const categoryBreakdown = Object.entries(categoryTotalsMap).map(([category, amount]) => {
    const percentage = totalOutflow > 0 ? ((amount / totalOutflow) * 100) : 0;
    return { category, amount, percentage };
  }).sort((a, b) => b.amount - a.amount);

  // PostgreSQL Category Budget Health Calculation with Substring/Keyword Harmonization
  const budgetHealthList = categories.map(cat => {
    const limit = Number(cat.targetBudget) || 10000;
    const catNameLower = cat.name.toLowerCase().trim();

    // Match transactions whose category matches cat.name OR shares key roots (FOOD -> Food & Dining)
    const spent = expenseTransactions
      .filter(t => {
        const txCat = (t.category || '').toLowerCase().trim();
        if (!txCat) return false;
        return txCat === catNameLower || catNameLower.includes(txCat) || txCat.includes(catNameLower);
      })
      .reduce((acc, t) => acc + Number(t.amount), 0);

    const remaining = limit - spent;
    const percentage = limit > 0 ? Math.min(100, Math.max(0, (spent / limit) * 100)) : 0;
    const isOver = spent > limit && limit > 0;
    const isNear = !isOver && percentage >= 80;

    return { id: cat.id, category: cat.name, icon: cat.icon, color: cat.color, spent, limit, remaining, percentage, isOver, isNear };
  });

  const totalOverallBudget = categories.reduce((acc, c) => acc + Number(c.targetBudget || 0), 0);

  // DB Category Operations
  const updateCategoryBudget = async (id, targetBudget) => {
    await financeApi.updateCategory(id, { targetBudget: parseFloat(targetBudget) });
    if (addToast) addToast(`Updated monthly target budget to ₹${targetBudget}!`, 'success');
    fetchData();
  };

  const addCategory = async ({ name, type, icon, color, targetBudget }) => {
    await financeApi.createCategory({
      name,
      type: type || 'EXPENSE',
      icon: icon || '📂',
      color: color || '#3B82F6',
      targetBudget: parseFloat(targetBudget) || 10000
    });
    if (addToast) addToast(`Category "${name}" created in PostgreSQL!`, 'success');
    fetchData();
  };

  const deleteCategory = async (id) => {
    await financeApi.deleteCategory(id);
    if (addToast) addToast(`Category deleted from PostgreSQL!`, 'info');
    fetchData();
  };

  // Operations
  const addDebt = async ({ personName, amount, debtType, dueDate, debtCategory, debtNotes }) => {
    const formattedNotes = `[${debtCategory}] ${dueDate ? `(Due: ${dueDate}) ` : ''}${debtNotes || ''}`;

    await financeApi.createDebt({
      personName,
      amount: parseFloat(amount),
      type: debtType,
      notes: formattedNotes
    });

    if (addToast) addToast(`Bank Ledger Entry of ₹${amount} recorded for ${personName}!`, 'success');
    fetchData();
  };

  const updateDebt = async (id, { amount, type, notes }) => {
    await financeApi.updateDebt(id, { amount: parseFloat(amount), type, notes });
    if (addToast) addToast(`Ledger Entry #${id} updated successfully!`, 'success');
    fetchData();
  };

  const deleteDebt = async (id) => {
    await financeApi.deleteDebt(id);
    if (addToast) addToast(`Ledger Entry #${id} deleted successfully!`, 'info');
    fetchData();
  };

  const batchDeleteDebts = async (ids) => {
    if (!ids || ids.length === 0) return;
    await financeApi.batchDeleteDebts(ids);
    if (addToast) addToast(`Deleted ${ids.length} selected ledger entries!`, 'info');
    fetchData();
  };

  const addWallet = async ({ name, balance }) => {
    await financeApi.createWallet({
      name,
      currency: 'INR',
      balance: parseFloat(balance) || 0.00
    });

    if (addToast) addToast(`Wallet "${name}" created!`, 'success');
    fetchData();
  };

  const addTransaction = async ({ amount, txType, category, noteContent }) => {
    let targetWalletId = selectedWalletId;

    if (!targetWalletId && wallets.length === 0) {
      const newWalletRes = await financeApi.createWallet({
        name: 'Main Wallet',
        currency: 'INR',
        balance: 0.00
      });
      targetWalletId = newWalletRes.data.id;
    } else if (!targetWalletId && wallets.length > 0) {
      targetWalletId = wallets[0].id;
    }

    const numAmt = parseFloat(amount);
    const catNameLower = (category || '').toLowerCase().trim();
    const catObj = categories.find(c => {
      const name = c.name.toLowerCase().trim();
      return name === catNameLower || name.includes(catNameLower) || catNameLower.includes(name);
    });

    const currentLimit = catObj ? Number(catObj.targetBudget) : 10000;
    const catHealth = budgetHealthList.find(b => b.category.toLowerCase().trim() === (catObj ? catObj.name.toLowerCase().trim() : ''));
    const currentSpent = catHealth ? catHealth.spent : 0;

    await financeApi.createTransaction({
      walletId: targetWalletId,
      amount: numAmt,
      transactionType: txType,
      category: category || 'General',
      description: noteContent || `${txType} transaction`
    });

    if (txType === 'EXPENSE' && currentSpent + numAmt > currentLimit && currentLimit > 0) {
      const overBy = (currentSpent + numAmt) - currentLimit;
      if (addToast) addToast(`⚠️ Expense logged! Note: ${category} is now over budget by ₹${overBy.toFixed(2)}!`, 'amber');
    } else {
      if (addToast) addToast(`${txType === 'INCOME' ? 'Income' : 'Expense'} of ₹${amount} logged!`, 'success');
    }

    fetchData();
  };

  // Derived Net Ledger Metrics across all contacts
  const netCreditSum = contactStatements.filter(cs => cs.netReceivable > 0).reduce((acc, cs) => acc + cs.netReceivable, 0);
  const netDebitSum = contactStatements.filter(cs => cs.netReceivable < 0).reduce((acc, cs) => acc + Math.abs(cs.netReceivable), 0);
  const totalWalletBalance = wallets.reduce((acc, w) => acc + Number(w.balance), 0);

  return {
    persons,
    debts,
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
    refetch: fetchData
  };
};
