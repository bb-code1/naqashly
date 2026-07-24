import { useState, useEffect, useCallback } from 'react';
import { financeApi } from '../api/financeApi';
import { useToast } from '../context/ToastContext';

/**
 * Decoupled Custom React Hook for Naqashly Ledger Data & Operations.
 * Supports Partial Repayment Calculations, Remaining Balances, and Progress Gauges.
 * 
 * @author Barkat Bashir
 * @version 3.0.0
 */
export const useFinance = () => {
  const { addToast } = useToast();
  const [debts, setDebts] = useState([]);
  const [wallets, setWallets] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedWalletId, setSelectedWalletId] = useState(null);

  // Fetch Live Data from financeApi
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [debtsRes, walletsRes, txRes] = await Promise.allSettled([
        financeApi.getDebts(),
        financeApi.getWallets(),
        financeApi.getTransactions()
      ]);

      if (debtsRes.status === 'fulfilled') {
        const parsedDebts = debtsRes.value.data.map(d => {
          let cleanNotes = d.notes || '';
          let parsedDueDate = '';

          if (cleanNotes.includes('(Due: ')) {
            const dueMatch = cleanNotes.match(/\(Due:\s*([^)]+)\)/);
            if (dueMatch) parsedDueDate = dueMatch[1];
          }

          const totalAmt = Number(d.amount) || 0;
          const paidAmt = Number(d.paidAmount) || 0;
          const remainingAmt = Math.max(0, totalAmt - paidAmt);
          const paidPercent = totalAmt > 0 ? Math.min(100, (paidAmt / totalAmt) * 100) : 0;

          const formattedGivenDate = d.createdAt
            ? new Date(d.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
            : new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

          return {
            ...d,
            totalAmt,
            paidAmt,
            remainingAmt,
            paidPercent,
            givenDate: formattedGivenDate,
            dueDate: parsedDueDate || 'No Due Date',
            cleanNotes: cleanNotes.replace(/\[.*?\]\s*/g, '').replace(/\(Due:\s*[^)]+\)\s*/g, '') || 'General Loan'
          };
        });
        setDebts(parsedDebts);
      }

      if (walletsRes.status === 'fulfilled') {
        const fetchedWallets = walletsRes.value.data;
        setWallets(fetchedWallets);
        if (fetchedWallets.length > 0) setSelectedWalletId(fetchedWallets[0].id);
      }

      if (txRes.status === 'fulfilled') setTransactions(txRes.value.data);
    } catch (err) {
      console.error('[useFinance] Error fetching finance data:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Operations
  const addDebt = async ({ personName, amount, debtType, dueDate, debtCategory, debtNotes }) => {
    const formattedNotes = `[${debtCategory}] ${dueDate ? `(Due: ${dueDate}) ` : ''}${debtNotes || ''}`;

    await financeApi.createDebt({
      personName,
      amount: parseFloat(amount),
      type: debtType,
      notes: formattedNotes
    });

    if (addToast) addToast(`Debt record of $${amount} added for ${personName}!`, 'success');
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

  const recordRepayment = async (id, repayAmount) => {
    const res = await financeApi.recordPartialRepayment(id, repayAmount);
    if (addToast) addToast(`💵 Partial repayment of $${repayAmount} recorded! Status: ${res.data.status}`, 'success');
    fetchData();
  };

  const toggleDebt = async (id) => {
    const res = await financeApi.toggleDebtStatus(id);
    if (addToast) addToast(`Settlement status updated to ${res.data.status}!`, 'success');
    fetchData();
  };

  // Derived Net Ledger Metrics
  const netCreditSum = debts.filter(d => d.debtType === 'CREDIT').reduce((acc, d) => acc + d.remainingAmt, 0);
  const netDebitSum = debts.filter(d => d.debtType === 'DEBIT').reduce((acc, d) => acc + d.remainingAmt, 0);
  const totalWalletBalance = wallets.reduce((acc, w) => acc + Number(w.balance), 0);

  return {
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
    recordRepayment,
    toggleDebt,
    refetch: fetchData
  };
};
