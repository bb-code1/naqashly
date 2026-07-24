import { useState, useEffect, useCallback } from 'react';
import { financeApi } from '../api/financeApi';
import { useToast } from '../context/ToastContext';

/**
 * Decoupled Custom React Hook for Naqashly Bank-Grade Double-Entry Interpersonal Ledger.
 * Computes Chronological Running Balances and Orders Latest Transactions First.
 * Supports Append, Update, Single Delete, and Batch Delete Ledger Operations.
 * 
 * @author Barkat Bashir
 * @version 10.0.0
 */
export const useFinance = () => {
  const { addToast } = useToast();
  const [persons, setPersons] = useState([]);
  const [debts, setDebts] = useState([]);
  const [wallets, setWallets] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedWalletId, setSelectedWalletId] = useState(null);

  // Fetch Live Data from financeApi
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [personsRes, debtsRes, walletsRes, txRes] = await Promise.allSettled([
        financeApi.getPersons(),
        financeApi.getDebts(),
        financeApi.getWallets(),
        financeApi.getTransactions()
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
      // Reverse array so latest/newest transactions display FIRST at top of statement table
      debts: [...enrichedDebts].reverse()
    };
  });

  // Operations
  const addDebt = async ({ personName, amount, debtType, dueDate, debtCategory, debtNotes }) => {
    const formattedNotes = `[${debtCategory}] ${dueDate ? `(Due: ${dueDate}) ` : ''}${debtNotes || ''}`;

    await financeApi.createDebt({
      personName,
      amount: parseFloat(amount),
      type: debtType,
      notes: formattedNotes
    });

    if (addToast) addToast(`Bank Ledger Entry of $${amount} recorded for ${personName}!`, 'success');
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
      currency: 'USD',
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
        currency: 'USD',
        balance: 0.00
      });
      targetWalletId = newWalletRes.data.id;
    } else if (!targetWalletId && wallets.length > 0) {
      targetWalletId = wallets[0].id;
    }

    await financeApi.createTransaction({
      walletId: targetWalletId,
      amount: parseFloat(amount),
      transactionType: txType,
      category: category || 'GENERAL',
      description: noteContent || `${txType} transaction`
    });

    if (addToast) addToast(`${txType === 'INCOME' ? 'Income' : 'Expense'} of $${amount} logged!`, 'success');
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
    contactStatements,
    loading,
    netCreditSum,
    netDebitSum,
    totalWalletBalance,
    addDebt,
    updateDebt,
    deleteDebt,
    batchDeleteDebts,
    addWallet,
    addTransaction,
    refetch: fetchData
  };
};
