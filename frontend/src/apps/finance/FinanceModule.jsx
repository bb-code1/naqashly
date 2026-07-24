import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { client } from '../../api/client';

/**
 * World-Class Enterprise Naqashly Ledger Application.
 * Glassmorphic Modal Dialog Overlays with Rich Interpersonal Debt Details (Due Date, Category & Notes).
 * 
 * @author Barkat Bashir
 * @version 7.0.0
 */
export const FinanceModule = () => {
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'transactions' | 'debts' | 'wallets'
  const [debts, setDebts] = useState([]);
  const [wallets, setWallets] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal Dialog Visibility States
  const [isTxModalOpen, setIsTxModalOpen] = useState(false);
  const [isDebtModalOpen, setIsDebtModalOpen] = useState(false);
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);

  // Rich Debt Form Inputs
  const [personName, setPersonName] = useState('');
  const [debtAmount, setDebtAmount] = useState('');
  const [debtType, setDebtType] = useState('CREDIT'); // 'CREDIT' | 'DEBIT'
  const [dueDate, setDueDate] = useState('');
  const [debtCategory, setDebtCategory] = useState('SHARED_EXPENSE');
  const [debtNotes, setDebtNotes] = useState('');

  // Wallet Form Inputs
  const [walletName, setWalletName] = useState('');
  const [initialBalance, setInitialBalance] = useState('');

  // Rich Transaction Form Inputs
  const [txAmount, setTxAmount] = useState('');
  const [txType, setTxType] = useState('EXPENSE');
  const [category, setCategory] = useState('FOOD');
  const [noteContent, setNoteContent] = useState('');
  const [selectedWalletId, setSelectedWalletId] = useState(null);

  // Fetch Live Data from finance-service via API Gateway (Port 8080)
  const fetchData = async () => {
    setLoading(true);
    try {
      const [debtsRes, walletsRes, txRes] = await Promise.allSettled([
        client.get('/finance/debts'),
        client.get('/finance/wallets'),
        client.get('/finance/transactions')
      ]);

      if (debtsRes.status === 'fulfilled') setDebts(debtsRes.value.data);
      if (walletsRes.status === 'fulfilled') {
        const fetchedWallets = walletsRes.value.data;
        setWallets(fetchedWallets);
        if (fetchedWallets.length > 0) {
          setSelectedWalletId(fetchedWallets[0].id);
        }
      }
      if (txRes.status === 'fulfilled') setTransactions(txRes.value.data);
    } catch (err) {
      console.error('[FinanceModule] Error fetching finance data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Form Submit Handlers
  const handleAddDebt = async (e) => {
    e.preventDefault();
    if (!personName || !debtAmount) return;

    // Format rich notes string with Category, Target Due Date & Notes
    const formattedNotes = `[${debtCategory}] ${dueDate ? `(Due: ${dueDate}) ` : ''}${debtNotes || 'Logged via Web Dashboard'}`;

    try {
      await client.post('/finance/debts', {
        personName,
        amount: parseFloat(debtAmount),
        type: debtType,
        notes: formattedNotes
      });
      setPersonName('');
      setDebtAmount('');
      setDueDate('');
      setDebtNotes('');
      setIsDebtModalOpen(false);
      fetchData();
    } catch (err) {
      console.error('[FinanceModule] Error adding debt:', err);
    }
  };

  const handleAddWallet = async (e) => {
    e.preventDefault();
    if (!walletName) return;
    try {
      await client.post('/finance/wallets', {
        name: walletName,
        currency: 'USD',
        balance: parseFloat(initialBalance) || 0
      });
      setWalletName('');
      setInitialBalance('');
      setIsWalletModalOpen(false);
      fetchData();
    } catch (err) {
      console.error('[FinanceModule] Error creating wallet:', err);
    }
  };

  const handleAddTx = async (e) => {
    e.preventDefault();
    if (!txAmount) return;

    let targetWalletId = selectedWalletId;

    if (!targetWalletId && wallets.length === 0) {
      try {
        const newWalletRes = await client.post('/finance/wallets', {
          name: 'Primary Wallet',
          currency: 'USD',
          balance: 1000.00
        });
        targetWalletId = newWalletRes.data.id;
      } catch (err) {
        console.error('[FinanceModule] Failed auto-creating primary wallet:', err);
        return;
      }
    } else if (!targetWalletId && wallets.length > 0) {
      targetWalletId = wallets[0].id;
    }

    try {
      await client.post('/finance/transactions', {
        walletId: targetWalletId,
        amount: parseFloat(txAmount),
        transactionType: txType,
        category: category || 'GENERAL',
        description: noteContent || 'Logged via Web Dashboard'
      });

      setTxAmount('');
      setNoteContent('');
      setIsTxModalOpen(false);
      fetchData();
    } catch (err) {
      console.error('[FinanceModule] Error logging transaction:', err);
    }
  };

  const toggleDebtStatus = async (id) => {
    try {
      const res = await client.put(`/finance/debts/${id}/toggle`);
      setDebts(prev => prev.map(d => (d.id === id ? res.data : d)));
    } catch (err) {
      console.error('[FinanceModule] Error toggling debt status:', err);
    }
  };

  // Derived Calculations
  const netCreditSum = debts.filter(d => d.debtType === 'CREDIT').reduce((acc, d) => acc + Number(d.amount), 0);
  const netDebitSum = debts.filter(d => d.debtType === 'DEBIT').reduce((acc, d) => acc + Number(d.amount), 0);
  const totalWalletBalance = wallets.reduce((acc, w) => acc + Number(w.balance), 0);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', width: '100%', paddingBottom: '4rem' }}>
      
      {/* 1. FULL-BLEED 4-CARD EXECUTIVE METRIC HEADER */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.25rem', width: '100%' }}>
        
        {/* Card 1: Total Net Worth */}
        <motion.div whileHover={{ y: -3 }} style={{
          background: 'linear-gradient(135deg, rgba(15, 21, 33, 0.85) 0%, rgba(22, 30, 48, 0.85) 100%)',
          border: '1px solid var(--border-highlight)',
          borderRadius: 'var(--radius-lg)',
          padding: '1.5rem',
          backdropFilter: 'blur(20px)',
          boxShadow: '0 12px 30px rgba(0,0,0,0.3)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Total Liquid Net Worth
            </span>
            <Badge variant="amber">Live DB</Badge>
          </div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '2.2rem', fontWeight: '800', color: 'var(--accent-amber)', letterSpacing: '-0.02em' }}>
            ${totalWalletBalance.toFixed(2)}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
            Across {wallets.length} active wallets
          </div>
        </motion.div>

        {/* Card 2: Money Owed To You */}
        <motion.div whileHover={{ y: -3 }} style={{
          background: 'rgba(12, 16, 26, 0.6)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-lg)',
          padding: '1.5rem',
          backdropFilter: 'blur(20px)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between'
        }}>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '0.75rem' }}>
            Money Owed To You (Credit)
          </div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '2.2rem', fontWeight: '800', color: 'var(--accent-emerald)', letterSpacing: '-0.02em' }}>
            +${netCreditSum.toFixed(2)}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--accent-emerald)', marginTop: '0.5rem', fontWeight: '600' }}>
            ✓ Receivables Ledger
          </div>
        </motion.div>

        {/* Card 3: Money You Owe */}
        <motion.div whileHover={{ y: -3 }} style={{
          background: 'rgba(12, 16, 26, 0.6)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-lg)',
          padding: '1.5rem',
          backdropFilter: 'blur(20px)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between'
        }}>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '0.75rem' }}>
            Money You Owe (Debit)
          </div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '2.2rem', fontWeight: '800', color: 'var(--accent-danger)', letterSpacing: '-0.02em' }}>
            -${netDebitSum.toFixed(2)}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--accent-danger)', marginTop: '0.5rem', fontWeight: '600' }}>
            ⚠️ Payables Ledger
          </div>
        </motion.div>

        {/* Card 4: Quick Action Controls */}
        <div style={{
          background: 'rgba(12, 16, 26, 0.6)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-lg)',
          padding: '1.25rem',
          backdropFilter: 'blur(20px)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          gap: '0.75rem'
        }}>
          <Button variant="emerald" onClick={() => setIsTxModalOpen(true)} style={{ width: '100%', padding: '0.75rem', fontSize: '0.88rem', justifyContent: 'center' }}>
            💸 + Log Transaction
          </Button>
          <Button variant="secondary" onClick={() => setIsDebtModalOpen(true)} style={{ width: '100%', padding: '0.75rem', fontSize: '0.88rem', justifyContent: 'center' }}>
            🤝 + Debt Record
          </Button>
        </div>
      </div>

      {/* 2. FULL-BLEED SEGMENTED SUB-TABS BAR */}
      <div style={{ display: 'flex', gap: '0.5rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.85rem', width: '100%' }}>
        {[
          { key: 'overview', label: '📊 Overview' },
          { key: 'transactions', label: '📑 Income & Expenses' },
          { key: 'debts', label: '🤝 Debt Settlement (/debts)' },
          { key: 'wallets', label: '💳 Multi-Wallet Hub' }
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            style={{
              padding: '0.6rem 1.25rem',
              borderRadius: 'var(--radius-md)',
              fontSize: '0.9rem',
              fontWeight: '600',
              cursor: 'pointer',
              background: activeTab === tab.key ? 'var(--accent-amber-glow)' : 'transparent',
              border: activeTab === tab.key ? '1px solid rgba(245, 158, 11, 0.4)' : '1px solid transparent',
              color: activeTab === tab.key ? 'var(--accent-amber)' : 'var(--text-muted)',
              transition: 'all 0.2s ease'
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* 3. SUB-TAB CONTENTS (Spanning 100% Width) */}

      {/* OVERVIEW TAB */}
      {activeTab === 'overview' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.75rem', width: '100%' }}>
          {/* Recent Transactions Card */}
          <div style={{ background: 'rgba(12, 16, 26, 0.5)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-lg)', padding: '1.75rem' }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: '700', color: 'var(--text-heading)', marginBottom: '1.25rem' }}>
              📑 Recent Income & Expense Logs
            </h3>
            {transactions.length === 0 ? (
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>No transactions logged yet.</p>
            ) : (
              transactions.slice(0, 4).map(t => (
                <div key={t.id} style={{ background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.04)', padding: '1rem 1.25rem', borderRadius: 'var(--radius-md)', marginBottom: '0.85rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontWeight: '600', color: 'var(--text-heading)', fontSize: '0.92rem' }}>{t.description || t.category}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>{t.category}</div>
                  </div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontWeight: '700', fontSize: '1rem', color: t.transactionType === 'INCOME' ? 'var(--accent-emerald)' : 'var(--accent-danger)' }}>
                    {t.transactionType === 'INCOME' ? '+' : '-'}${Number(t.amount).toFixed(2)}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Debt Highlights Card */}
          <div style={{ background: 'rgba(12, 16, 26, 0.5)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-lg)', padding: '1.75rem' }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: '700', color: 'var(--text-heading)', marginBottom: '1.25rem' }}>
              🤝 Debt Settlement Highlights
            </h3>
            {debts.length === 0 ? (
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>No debt records found.</p>
            ) : (
              debts.slice(0, 4).map(d => (
                <div key={d.id} style={{ background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.04)', padding: '1rem 1.25rem', borderRadius: 'var(--radius-md)', marginBottom: '0.85rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontWeight: '600', color: 'var(--text-heading)', fontSize: '0.92rem' }}>{d.personName}</div>
                    <div style={{ fontSize: '0.75rem', color: d.debtType === 'CREDIT' ? 'var(--accent-emerald)' : 'var(--accent-danger)', fontWeight: '700', marginTop: '0.15rem' }}>
                      {d.debtType} (${Number(d.amount).toFixed(2)})
                    </div>
                  </div>
                  <Button variant="outline" onClick={() => toggleDebtStatus(d.id)} style={{ fontSize: '0.78rem', padding: '0.35rem 0.85rem' }}>
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
        <div style={{ background: 'rgba(12, 16, 26, 0.5)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-lg)', padding: '2rem', width: '100%' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: '700', color: 'var(--text-heading)' }}>Income & Expense History</h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>All financial transactions saved in PostgreSQL naqashly_finance_db.</p>
            </div>
            <Button variant="emerald" onClick={() => setIsTxModalOpen(true)}>+ Log Expense / Income</Button>
          </div>

          {loading ? (
            <div style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>Fetching live transactions...</div>
          ) : transactions.length === 0 ? (
            <div style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>No transaction history found.</div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '0 0.6rem', fontSize: '0.88rem' }}>
              <thead>
                <tr>
                  <th style={{ textAlign: 'left', color: 'var(--text-muted)', padding: '0 1rem 0.6rem', fontWeight: '600' }}>Note & Context (Why, What, With Whom)</th>
                  <th style={{ textAlign: 'left', color: 'var(--text-muted)', padding: '0 1rem 0.6rem', fontWeight: '600' }}>Category</th>
                  <th style={{ textAlign: 'left', color: 'var(--text-muted)', padding: '0 1rem 0.6rem', fontWeight: '600' }}>Amount</th>
                  <th style={{ textAlign: 'left', color: 'var(--text-muted)', padding: '0 1rem 0.6rem', fontWeight: '600' }}>Type</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map(t => (
                  <tr key={t.id} style={{ background: 'rgba(0,0,0,0.25)', borderRadius: '8px' }}>
                    <td style={{ padding: '1rem', color: 'var(--text-heading)', borderTopLeftRadius: '8px', borderBottomLeftRadius: '8px' }}>
                      {t.description || 'General Log'}
                    </td>
                    <td style={{ padding: '1rem', color: 'var(--text-muted)' }}>{t.category}</td>
                    <td style={{ padding: '1rem', fontFamily: 'var(--font-mono)', fontWeight: '700', fontSize: '0.95rem', color: t.transactionType === 'INCOME' ? 'var(--accent-emerald)' : 'var(--accent-danger)' }}>
                      {t.transactionType === 'INCOME' ? '+' : '-'}${Number(t.amount).toFixed(2)}
                    </td>
                    <td style={{ padding: '1rem', borderTopRightRadius: '8px', borderBottomRightRadius: '8px' }}>
                      <Badge variant={t.transactionType === 'INCOME' ? 'emerald' : 'amber'}>{t.transactionType}</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* DEBTS TAB */}
      {activeTab === 'debts' && (
        <div style={{ background: 'rgba(12, 16, 26, 0.5)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-lg)', padding: '2rem', width: '100%' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: '700', color: 'var(--text-heading)' }}>Interpersonal Debt Ledger (/debts)</h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Track credit (lent) vs debit (borrowed) and toggle settlement status.</p>
            </div>
            <Button variant="secondary" onClick={() => setIsDebtModalOpen(true)}>+ Add Debt Record</Button>
          </div>

          <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '0 0.6rem', fontSize: '0.88rem' }}>
            <thead>
              <tr>
                <th style={{ textAlign: 'left', color: 'var(--text-muted)', padding: '0 1rem 0.6rem', fontWeight: '600' }}>Contact Person</th>
                <th style={{ textAlign: 'left', color: 'var(--text-muted)', padding: '0 1rem 0.6rem', fontWeight: '600' }}>Amount</th>
                <th style={{ textAlign: 'left', color: 'var(--text-muted)', padding: '0 1rem 0.6rem', fontWeight: '600' }}>Type</th>
                <th style={{ textAlign: 'left', color: 'var(--text-muted)', padding: '0 1rem 0.6rem', fontWeight: '600' }}>Target Due Date & Context Notes</th>
                <th style={{ textAlign: 'left', color: 'var(--text-muted)', padding: '0 1rem 0.6rem', fontWeight: '600' }}>Settlement Toggle</th>
              </tr>
            </thead>
            <tbody>
              {debts.map(d => (
                <tr key={d.id} style={{ background: 'rgba(0,0,0,0.25)', borderRadius: '8px' }}>
                  <td style={{ padding: '1rem', color: 'var(--text-heading)', fontWeight: '600', borderTopLeftRadius: '8px', borderBottomLeftRadius: '8px' }}>
                    {d.personName}
                  </td>
                  <td style={{ padding: '1rem', fontFamily: 'var(--font-mono)', fontWeight: '700', fontSize: '0.95rem', color: 'var(--text-heading)' }}>
                    ${Number(d.amount).toFixed(2)}
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <span style={{ color: d.debtType === 'CREDIT' ? 'var(--accent-emerald)' : 'var(--accent-danger)', fontWeight: '700' }}>
                      {d.debtType}
                    </span>
                  </td>
                  <td style={{ padding: '1rem', color: 'var(--text-muted)', fontSize: '0.82rem' }}>
                    {d.notes || 'No context notes attached'}
                  </td>
                  <td style={{ padding: '1rem', borderTopRightRadius: '8px', borderBottomRightRadius: '8px' }}>
                    <button
                      onClick={() => toggleDebtStatus(d.id)}
                      style={{
                        background: d.status === 'PAID' ? 'var(--accent-emerald-glow)' : 'rgba(255, 255, 255, 0.04)',
                        border: d.status === 'PAID' ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid var(--border-subtle)',
                        color: d.status === 'PAID' ? 'var(--accent-emerald)' : 'var(--text-muted)',
                        padding: '0.4rem 1rem',
                        borderRadius: '9999px',
                        fontSize: '0.78rem',
                        fontWeight: '600',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease'
                      }}
                    >
                      {d.status === 'PAID' ? '✅ PAID' : '⏳ PENDING'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* WALLETS TAB */}
      {activeTab === 'wallets' && (
        <div style={{ background: 'rgba(12, 16, 26, 0.5)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-lg)', padding: '2rem', width: '100%' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: '700', color: 'var(--text-heading)' }}>Financial Accounts & Wallets</h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Manage bank accounts, cash wallets, and crypto vaults.</p>
            </div>
            <Button variant="secondary" onClick={() => setIsWalletModalOpen(true)}>+ Create New Wallet</Button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.25rem', width: '100%' }}>
            {wallets.map(w => (
              <motion.div key={w.id} whileHover={{ y: -3 }} style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border-highlight)', borderRadius: 'var(--radius-md)', padding: '1.5rem' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Account Wallet</div>
                <h4 style={{ fontSize: '1.1rem', fontWeight: '700', color: 'var(--text-heading)', marginBottom: '0.75rem' }}>{w.name}</h4>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1.75rem', fontWeight: '800', color: 'var(--accent-amber)' }}>
                  ${Number(w.balance).toFixed(2)}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* 4. MODAL DIALOG OVERLAYS (Linear/Stripe-Grade Focus UX) */}

      {/* A. TRANSACTION LOGGING MODAL OVERLAY */}
      <AnimatePresence>
        {isTxModalOpen && (
          <div style={{
            position: 'fixed', inset: 0, zIndex: 9999,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'rgba(0, 0, 0, 0.75)', backdropFilter: 'blur(16px)'
          }}>
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              style={{
                width: '100%', maxWidth: '640px',
                background: '#0E131F', border: '1px solid var(--border-highlight)',
                borderRadius: 'var(--radius-lg)', padding: '2.25rem',
                boxShadow: '0 30px 60px rgba(0,0,0,0.9)'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <div>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: '700', color: 'var(--text-heading)' }}>
                    💸 Record Financial Transaction
                  </h3>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                    Saves directly to PostgreSQL naqashly_finance_db
                  </p>
                </div>
                <button onClick={() => setIsTxModalOpen(false)} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', fontSize: '1.2rem', cursor: 'pointer' }}>
                  ✕
                </button>
              </div>

              <form onSubmit={handleAddTx} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                {/* Type Selector */}
                <div>
                  <label style={{ fontSize: '0.78rem', fontWeight: '600', color: 'var(--text-muted)', display: 'block', marginBottom: '0.4rem' }}>Type</label>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button
                      type="button"
                      onClick={() => setTxType('EXPENSE')}
                      style={{
                        flex: 1, padding: '0.65rem', borderRadius: '8px', border: 'none',
                        background: txType === 'EXPENSE' ? 'var(--accent-danger)' : 'rgba(255,255,255,0.05)',
                        color: '#FFF', fontWeight: '700', fontSize: '0.85rem', cursor: 'pointer'
                      }}
                    >
                      - EXPENSE
                    </button>
                    <button
                      type="button"
                      onClick={() => setTxType('INCOME')}
                      style={{
                        flex: 1, padding: '0.65rem', borderRadius: '8px', border: 'none',
                        background: txType === 'INCOME' ? 'var(--accent-emerald)' : 'rgba(255,255,255,0.05)',
                        color: '#FFF', fontWeight: '700', fontSize: '0.85rem', cursor: 'pointer'
                      }}
                    >
                      + INCOME
                    </button>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  {/* Amount */}
                  <div>
                    <label style={{ fontSize: '0.78rem', fontWeight: '600', color: 'var(--text-muted)', display: 'block', marginBottom: '0.4rem' }}>Amount ($)</label>
                    <input
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      value={txAmount}
                      onChange={e => setTxAmount(e.target.value)}
                      style={{ width: '100%', padding: '0.7rem', background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border-subtle)', color: '#FFF', borderRadius: '8px', fontFamily: 'var(--font-mono)' }}
                      required
                    />
                  </div>

                  {/* Category */}
                  <div>
                    <label style={{ fontSize: '0.78rem', fontWeight: '600', color: 'var(--text-muted)', display: 'block', marginBottom: '0.4rem' }}>Category</label>
                    <select
                      value={category}
                      onChange={e => setCategory(e.target.value)}
                      style={{ width: '100%', padding: '0.7rem', background: '#080B11', border: '1px solid var(--border-subtle)', color: '#FFF', borderRadius: '8px', fontSize: '0.85rem' }}
                    >
                      <option value="FOOD">🍔 Food & Dining</option>
                      <option value="RENT">🏠 Rent & Housing</option>
                      <option value="SALARY">💰 Salary & Income</option>
                      <option value="ELECTRONICS">💻 Electronics & Gear</option>
                      <option value="TRAVEL">🚗 Transport & Travel</option>
                      <option value="UTILITIES">⚡ Bills & Utilities</option>
                      <option value="SHOPPING">🛍️ General Shopping</option>
                    </select>
                  </div>
                </div>

                {/* Rich Note Field */}
                <div>
                  <label style={{ fontSize: '0.78rem', fontWeight: '600', color: 'var(--text-muted)', display: 'block', marginBottom: '0.4rem' }}>
                    📝 Note & Context (Why, What, With Whom)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., Client lunch at Cafe with Tariq & Bilal"
                    value={noteContent}
                    onChange={e => setNoteContent(e.target.value)}
                    style={{ width: '100%', padding: '0.75rem', background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border-subtle)', color: '#FFF', borderRadius: '8px', fontSize: '0.88rem' }}
                  />
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
                  <Button variant="secondary" onClick={() => setIsTxModalOpen(false)}>Cancel</Button>
                  <Button type="submit">Confirm & Save Entry →</Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* B. ADD DEBT MODAL OVERLAY (With Due Date, Category & Notes) */}
      <AnimatePresence>
        {isDebtModalOpen && (
          <div style={{
            position: 'fixed', inset: 0, zIndex: 9999,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'rgba(0, 0, 0, 0.75)', backdropFilter: 'blur(16px)'
          }}>
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              style={{
                width: '100%', maxWidth: '600px',
                background: '#0E131F', border: '1px solid var(--border-highlight)',
                borderRadius: 'var(--radius-lg)', padding: '2.25rem',
                boxShadow: '0 30px 60px rgba(0,0,0,0.9)'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <div>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: '700', color: 'var(--text-heading)' }}>
                    🤝 Add Interpersonal Debt Record
                  </h3>
                  <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
                    Tracks credit (lent) vs debit (borrowed) with target due dates & notes.
                  </p>
                </div>
                <button onClick={() => setIsDebtModalOpen(false)} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', fontSize: '1.2rem', cursor: 'pointer' }}>
                  ✕
                </button>
              </div>

              <form onSubmit={handleAddDebt} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                {/* Contact Person Name */}
                <div>
                  <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.4rem' }}>Contact Person Name</label>
                  <input
                    type="text"
                    placeholder="Tariq Ahmad"
                    value={personName}
                    onChange={e => setPersonName(e.target.value)}
                    style={{ width: '100%', padding: '0.7rem', background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border-subtle)', color: '#FFF', borderRadius: '8px' }}
                    required
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  {/* Amount */}
                  <div>
                    <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.4rem' }}>Amount ($)</label>
                    <input
                      type="number"
                      step="0.01"
                      placeholder="150.00"
                      value={debtAmount}
                      onChange={e => setDebtAmount(e.target.value)}
                      style={{ width: '100%', padding: '0.7rem', background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border-subtle)', color: '#FFF', borderRadius: '8px', fontFamily: 'var(--font-mono)' }}
                      required
                    />
                  </div>

                  {/* Debt Type */}
                  <div>
                    <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.4rem' }}>Debt Type</label>
                    <select
                      value={debtType}
                      onChange={e => setDebtType(e.target.value)}
                      style={{ width: '100%', padding: '0.7rem', background: '#080B11', border: '1px solid var(--border-subtle)', color: '#FFF', borderRadius: '8px', fontSize: '0.85rem' }}
                    >
                      <option value="CREDIT">CREDIT (Money You Lent)</option>
                      <option value="DEBIT">DEBIT (Money You Owe)</option>
                    </select>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  {/* Target Due Date */}
                  <div>
                    <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.4rem' }}>📅 Target Settlement Due Date</label>
                    <input
                      type="date"
                      value={dueDate}
                      onChange={e => setDueDate(e.target.value)}
                      style={{ width: '100%', padding: '0.7rem', background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border-subtle)', color: '#FFF', borderRadius: '8px', fontSize: '0.85rem' }}
                    />
                  </div>

                  {/* Category Purpose */}
                  <div>
                    <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.4rem' }}>🏷️ Purpose Category</label>
                    <select
                      value={debtCategory}
                      onChange={e => setDebtCategory(e.target.value)}
                      style={{ width: '100%', padding: '0.7rem', background: '#080B11', border: '1px solid var(--border-subtle)', color: '#FFF', borderRadius: '8px', fontSize: '0.85rem' }}
                    >
                      <option value="SHARED_EXPENSE">🍽️ Shared Dining & Outing</option>
                      <option value="PERSONAL_LOAN">🤝 Personal Loan</option>
                      <option value="TRAVEL">✈️ Travel & Hotel Share</option>
                      <option value="BUSINESS">💼 Business Advance</option>
                      <option value="EMERGENCY">🚨 Emergency Cash</option>
                    </select>
                  </div>
                </div>

                {/* Context Notes */}
                <div>
                  <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.4rem' }}>
                    📝 Context Notes & Reason
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., Dinner & Uber share for Team Outing"
                    value={debtNotes}
                    onChange={e => setDebtNotes(e.target.value)}
                    style={{ width: '100%', padding: '0.75rem', background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border-subtle)', color: '#FFF', borderRadius: '8px', fontSize: '0.88rem' }}
                  />
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
                  <Button variant="secondary" onClick={() => setIsDebtModalOpen(false)}>Cancel</Button>
                  <Button type="submit">Save Debt Record →</Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* C. CREATE WALLET MODAL OVERLAY */}
      <AnimatePresence>
        {isWalletModalOpen && (
          <div style={{
            position: 'fixed', inset: 0, zIndex: 9999,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'rgba(0, 0, 0, 0.75)', backdropFilter: 'blur(16px)'
          }}>
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              style={{
                width: '100%', maxWidth: '500px',
                background: '#0E131F', border: '1px solid var(--border-highlight)',
                borderRadius: 'var(--radius-lg)', padding: '2.25rem',
                boxShadow: '0 30px 60px rgba(0,0,0,0.9)'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h3 style={{ fontSize: '1.2rem', fontWeight: '700', color: 'var(--text-heading)' }}>
                  💳 Create New Wallet Account
                </h3>
                <button onClick={() => setIsWalletModalOpen(false)} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', fontSize: '1.2rem', cursor: 'pointer' }}>
                  ✕
                </button>
              </div>

              <form onSubmit={handleAddWallet} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div>
                  <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.4rem' }}>Wallet Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Bank Account, Cash Wallet, Crypto Vault"
                    value={walletName}
                    onChange={e => setWalletName(e.target.value)}
                    style={{ width: '100%', padding: '0.7rem', background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border-subtle)', color: '#FFF', borderRadius: '8px' }}
                    required
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.4rem' }}>Initial Balance ($)</label>
                  <input
                    type="number"
                    placeholder="0.00"
                    value={initialBalance}
                    onChange={e => setInitialBalance(e.target.value)}
                    style={{ width: '100%', padding: '0.7rem', background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border-subtle)', color: '#FFF', borderRadius: '8px' }}
                  />
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
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
