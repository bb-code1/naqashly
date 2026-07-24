import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { client } from '../../api/client';

/**
 * Decluttered Enterprise Finance Ledger & Transaction Module.
 * 
 * Fixes & Enhancements:
 * 1. Resolves 400 Bad Request by mapping 'transactionType: txType' matching backend DTO.
 * 2. Auto-creates primary wallet if no wallets exist.
 * 3. Rich Custom Note Field (Why, What, With Whom, Description).
 * 4. Ultra-sleek, decluttered UI/UX layout with Framer Motion animations.
 * 
 * @author Barkat Bashir
 * @version 3.0.0
 */
export const FinanceModule = () => {
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'wallets' | 'transactions' | 'debts'
  const [debts, setDebts] = useState([]);
  const [wallets, setWallets] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form Visibility Modals
  const [showAddDebt, setShowAddDebt] = useState(false);
  const [showAddWallet, setShowAddWallet] = useState(false);
  const [showAddTx, setShowAddTx] = useState(false);

  // Form Field Inputs
  const [personName, setPersonName] = useState('');
  const [debtAmount, setDebtAmount] = useState('');
  const [debtType, setDebtType] = useState('CREDIT');

  const [walletName, setWalletName] = useState('');
  const [initialBalance, setInitialBalance] = useState('');

  // Rich Transaction Form Inputs
  const [txAmount, setTxAmount] = useState('');
  const [txType, setTxType] = useState('EXPENSE'); // 'INCOME' | 'EXPENSE'
  const [category, setCategory] = useState('FOOD');
  const [noteContent, setNoteContent] = useState(''); // Rich Note: Why, What, With Whom
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
    try {
      await client.post('/finance/debts', {
        personName,
        amount: parseFloat(debtAmount),
        type: debtType,
        notes: 'Logged via Web Dashboard'
      });
      setPersonName('');
      setDebtAmount('');
      setShowAddDebt(false);
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
      setShowAddWallet(false);
      fetchData();
    } catch (err) {
      console.error('[FinanceModule] Error creating wallet:', err);
    }
  };

  // Requirement B & C Fix: Correct DTO field mapping ('transactionType') & Rich Note/Context
  const handleAddTx = async (e) => {
    e.preventDefault();
    if (!txAmount) return;

    let targetWalletId = selectedWalletId;

    // Auto-create default primary wallet if user has no wallets yet
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
      // Maps transactionType matching Spring Boot DTO + Rich Note description
      await client.post('/finance/transactions', {
        walletId: targetWalletId,
        amount: parseFloat(txAmount),
        transactionType: txType, // Fixed mapping matching DTO
        category: category || 'GENERAL',
        description: noteContent || 'Logged via Web Dashboard'
      });

      setTxAmount('');
      setNoteContent('');
      setShowAddTx(false);
      fetchData(); // Refresh live PostgreSQL database state
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
    <Card className="col-12" style={{ border: '1px solid var(--border-highlight)', padding: '2rem' }}>
      {/* Requirement A: Decluttered Sleek Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          <div style={{
            width: '44px', height: '44px', borderRadius: '12px',
            background: 'linear-gradient(135deg, var(--accent-amber) 0%, #D97706 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '1.3rem', boxShadow: '0 0 24px rgba(245, 158, 11, 0.25)'
          }}>
            💰
          </div>
          <div>
            <h2 style={{ fontSize: '1.3rem', fontWeight: '800', color: 'var(--text-heading)', letterSpacing: '-0.02em' }}>
              Naqashly Ledger
            </h2>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
              Personal Financial Overview, Multi-Wallet Balances & Interpersonal Debt Settlement
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Button variant="emerald" onClick={() => setShowAddTx(!showAddTx)}>
            {showAddTx ? '✕ Close Form' : '+ Log Expense / Income'}
          </Button>
          <Button variant="secondary" onClick={() => setShowAddDebt(!showAddDebt)}>
            {showAddDebt ? '✕ Close' : '+ Debt Record'}
          </Button>
        </div>
      </div>

      {/* Requirement C & B: Sleek Modal Form for Logging Expenses with Rich Note Field */}
      <AnimatePresence>
        {showAddTx && (
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: -10 }}
            style={{
              background: '#0E131F',
              border: '1px solid var(--border-highlight)',
              borderRadius: 'var(--radius-lg)',
              padding: '1.75rem',
              marginBottom: '2rem',
              boxShadow: '0 20px 40px rgba(0,0,0,0.6)'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h3 style={{ fontSize: '1.05rem', fontWeight: '700', color: 'var(--text-heading)' }}>
                💸 Record New Transaction
              </h3>
              <span style={{ fontSize: '0.75rem', color: 'var(--accent-amber)', fontFamily: 'var(--font-mono)' }}>
                Saves to PostgreSQL naqashly_finance_db
              </span>
            </div>

            <form onSubmit={handleAddTx} style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.25rem' }}>
              {/* 1. Transaction Type Toggle */}
              <div>
                <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.4rem' }}>Type</label>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button
                    type="button"
                    onClick={() => setTxType('EXPENSE')}
                    style={{
                      flex: 1, padding: '0.55rem', borderRadius: '8px', border: 'none',
                      background: txType === 'EXPENSE' ? 'var(--accent-danger)' : 'rgba(255,255,255,0.05)',
                      color: '#FFF', fontWeight: '700', fontSize: '0.82rem', cursor: 'pointer'
                    }}
                  >
                    - EXPENSE
                  </button>
                  <button
                    type="button"
                    onClick={() => setTxType('INCOME')}
                    style={{
                      flex: 1, padding: '0.55rem', borderRadius: '8px', border: 'none',
                      background: txType === 'INCOME' ? 'var(--accent-emerald)' : 'rgba(255,255,255,0.05)',
                      color: '#FFF', fontWeight: '700', fontSize: '0.82rem', cursor: 'pointer'
                    }}
                  >
                    + INCOME
                  </button>
                </div>
              </div>

              {/* 2. Amount Input */}
              <div>
                <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.4rem' }}>Amount ($)</label>
                <input
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={txAmount}
                  onChange={e => setTxAmount(e.target.value)}
                  style={{ width: '100%', padding: '0.6rem', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-subtle)', color: '#FFF', borderRadius: '8px', fontFamily: 'var(--font-mono)' }}
                  required
                />
              </div>

              {/* 3. Category Selector */}
              <div>
                <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.4rem' }}>Category</label>
                <select
                  value={category}
                  onChange={e => setCategory(e.target.value)}
                  style={{ width: '100%', padding: '0.6rem', background: '#080B11', border: '1px solid var(--border-subtle)', color: '#FFF', borderRadius: '8px' }}
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

              {/* Requirement C: Custom Note Field (Why, What, With Whom) */}
              <div style={{ gridColumn: 'span 3' }}>
                <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.4rem' }}>
                  📝 Note & Context (Why, What, With Whom)
                </label>
                <input
                  type="text"
                  placeholder="e.g., Client lunch at Cafe with Tariq & Bilal (Project Review)"
                  value={noteContent}
                  onChange={e => setNoteContent(e.target.value)}
                  style={{ width: '100%', padding: '0.7rem', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-subtle)', color: '#FFF', borderRadius: '8px' }}
                />
              </div>

              <div style={{ gridColumn: 'span 3', display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
                <Button variant="secondary" onClick={() => setShowAddTx(false)}>Cancel</Button>
                <Button type="submit">Confirm & Save Transaction →</Button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add Debt Slide Form */}
      <AnimatePresence>
        {showAddDebt && (
          <motion.form
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            onSubmit={handleAddDebt}
            style={{ background: 'rgba(0,0,0,0.4)', border: '1px solid var(--border-highlight)', padding: '1.25rem', borderRadius: 'var(--radius-md)', marginBottom: '2rem', display: 'flex', gap: '0.85rem', alignItems: 'center' }}
          >
            <input
              type="text"
              placeholder="Contact Person Name"
              value={personName}
              onChange={e => setPersonName(e.target.value)}
              style={{ flex: 1, padding: '0.6rem', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-subtle)', color: '#FFF', borderRadius: '8px' }}
              required
            />
            <input
              type="number"
              placeholder="Amount ($)"
              value={debtAmount}
              onChange={e => setDebtAmount(e.target.value)}
              style={{ width: '140px', padding: '0.6rem', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-subtle)', color: '#FFF', borderRadius: '8px' }}
              required
            />
            <select
              value={debtType}
              onChange={e => setDebtType(e.target.value)}
              style={{ padding: '0.6rem', background: '#0E131F', border: '1px solid var(--border-subtle)', color: '#FFF', borderRadius: '8px' }}
            >
              <option value="CREDIT">CREDIT (Money You Lent)</option>
              <option value="DEBIT">DEBIT (Money You Owe)</option>
            </select>
            <Button type="submit">Save Debt Record</Button>
          </motion.form>
        )}
      </AnimatePresence>

      {/* Net Worth & Financial Balance Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '2rem' }}>
        <motion.div whileHover={{ y: -3 }} style={{ background: 'rgba(0, 0, 0, 0.3)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', padding: '1.25rem' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.35rem' }}>Net Wallet Balance</div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1.6rem', fontWeight: '800', color: 'var(--accent-amber)' }}>
            ${totalWalletBalance.toFixed(2)}
          </div>
        </motion.div>

        <motion.div whileHover={{ y: -3 }} style={{ background: 'rgba(0, 0, 0, 0.3)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', padding: '1.25rem' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.35rem' }}>Money Owed To You (Credit)</div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1.6rem', fontWeight: '800', color: 'var(--accent-emerald)' }}>
            ${netCreditSum.toFixed(2)}
          </div>
        </motion.div>

        <motion.div whileHover={{ y: -3 }} style={{ background: 'rgba(0, 0, 0, 0.3)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', padding: '1.25rem' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.35rem' }}>Money You Owe (Debit)</div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1.6rem', fontWeight: '800', color: 'var(--accent-danger)' }}>
            ${netDebitSum.toFixed(2)}
          </div>
        </motion.div>

        <motion.div whileHover={{ y: -3 }} style={{ background: 'rgba(0, 0, 0, 0.3)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', padding: '1.25rem' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.35rem' }}>Logged Transactions</div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1.6rem', fontWeight: '800', color: 'var(--accent-indigo)' }}>
            {transactions.length} Entries
          </div>
        </motion.div>
      </div>

      {/* Requirement A: Decluttered Segmented Sub-Tab Bar */}
      <div style={{ display: 'flex', gap: '0.5rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.85rem', marginBottom: '1.75rem' }}>
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
              padding: '0.55rem 1.1rem',
              borderRadius: 'var(--radius-md)',
              fontSize: '0.88rem',
              fontWeight: '600',
              cursor: 'pointer',
              background: activeTab === tab.key ? 'var(--accent-amber-glow)' : 'transparent',
              border: activeTab === tab.key ? '1px solid rgba(245, 158, 11, 0.4)' : 'none',
              color: activeTab === tab.key ? 'var(--accent-amber)' : 'var(--text-muted)',
              transition: 'all 0.2s ease'
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* SUB-TAB CONTENTS */}

      {/* 1. OVERVIEW TAB */}
      {activeTab === 'overview' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.5rem' }}>
          <div>
            <h3 style={{ fontSize: '1rem', fontWeight: '700', color: 'var(--text-heading)', marginBottom: '1rem' }}>
              📑 Recent Income & Expense Logs
            </h3>
            {transactions.length === 0 ? (
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>No transactions logged yet. Click "+ Log Expense / Income" above!</p>
            ) : (
              transactions.slice(0, 4).map(t => (
                <div key={t.id} style={{ background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border-subtle)', padding: '1rem', borderRadius: 'var(--radius-md)', marginBottom: '0.75rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontWeight: '600', color: 'var(--text-heading)' }}>{t.description || t.category}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{t.category}</div>
                  </div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontWeight: '700', color: t.transactionType === 'INCOME' ? 'var(--accent-emerald)' : 'var(--accent-danger)' }}>
                    {t.transactionType === 'INCOME' ? '+' : '-'}${Number(t.amount).toFixed(2)}
                  </div>
                </div>
              ))
            )}
          </div>

          <div>
            <h3 style={{ fontSize: '1rem', fontWeight: '700', color: 'var(--text-heading)', marginBottom: '1rem' }}>
              🤝 Debt Ledger Status
            </h3>
            {debts.length === 0 ? (
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>No debt records found.</p>
            ) : (
              debts.slice(0, 4).map(d => (
                <div key={d.id} style={{ background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border-subtle)', padding: '1rem', borderRadius: 'var(--radius-md)', marginBottom: '0.75rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontWeight: '600', color: 'var(--text-heading)' }}>{d.personName}</div>
                    <span style={{ fontSize: '0.72rem', color: d.debtType === 'CREDIT' ? 'var(--accent-emerald)' : 'var(--accent-danger)', fontWeight: '700' }}>{d.debtType} (${Number(d.amount).toFixed(2)})</span>
                  </div>
                  <Button variant="outline" onClick={() => toggleDebtStatus(d.id)} style={{ fontSize: '0.75rem' }}>
                    {d.status === 'PAID' ? '✅ PAID' : '⏳ PENDING'}
                  </Button>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* 2. TRANSACTIONS TAB (Requirement B & C Fix) */}
      {activeTab === 'transactions' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: '700', color: 'var(--text-heading)' }}>Income & Expense History</h3>
            <Button variant="emerald" onClick={() => setShowAddTx(true)}>+ Log Expense / Income</Button>
          </div>

          {loading ? (
            <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Fetching live transactions from PostgreSQL...</div>
          ) : transactions.length === 0 ? (
            <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>No transaction history. Click "+ Log Expense / Income" above to save one!</div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                  <th style={{ textAlign: 'left', color: 'var(--text-muted)', paddingBottom: '0.75rem' }}>Note & Context (Why, What, With Whom)</th>
                  <th style={{ textAlign: 'left', color: 'var(--text-muted)', paddingBottom: '0.75rem' }}>Category</th>
                  <th style={{ textAlign: 'left', color: 'var(--text-muted)', paddingBottom: '0.75rem' }}>Amount</th>
                  <th style={{ textAlign: 'left', color: 'var(--text-muted)', paddingBottom: '0.75rem' }}>Type</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map(t => (
                  <tr key={t.id} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.03)' }}>
                    <td style={{ padding: '0.85rem 0', color: 'var(--text-heading)' }}>{t.description || 'General Log'}</td>
                    <td style={{ color: 'var(--text-muted)' }}>{t.category}</td>
                    <td style={{ fontFamily: 'var(--font-mono)', fontWeight: '700', color: t.transactionType === 'INCOME' ? 'var(--accent-emerald)' : 'var(--accent-danger)' }}>
                      {t.transactionType === 'INCOME' ? '+' : '-'}${Number(t.amount).toFixed(2)}
                    </td>
                    <td>
                      <Badge variant={t.transactionType === 'INCOME' ? 'emerald' : 'amber'}>{t.transactionType}</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* 3. DEBTS TAB */}
      {activeTab === 'debts' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: '700', color: 'var(--text-heading)' }}>Interpersonal Debt Ledger (/debts)</h3>
            <Button variant="secondary" onClick={() => setShowAddDebt(true)}>+ Add Debt Record</Button>
          </div>

          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                <th style={{ textAlign: 'left', color: 'var(--text-muted)', paddingBottom: '0.75rem' }}>Contact Person</th>
                <th style={{ textAlign: 'left', color: 'var(--text-muted)', paddingBottom: '0.75rem' }}>Amount</th>
                <th style={{ textAlign: 'left', color: 'var(--text-muted)', paddingBottom: '0.75rem' }}>Type</th>
                <th style={{ textAlign: 'left', color: 'var(--text-muted)', paddingBottom: '0.75rem' }}>Settlement Toggle</th>
              </tr>
            </thead>
            <tbody>
              {debts.map(d => (
                <tr key={d.id} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.03)' }}>
                  <td style={{ padding: '0.85rem 0', color: 'var(--text-heading)', fontWeight: '600' }}>{d.personName}</td>
                  <td style={{ fontFamily: 'var(--font-mono)', fontWeight: '700', color: 'var(--text-heading)' }}>
                    ${Number(d.amount).toFixed(2)}
                  </td>
                  <td>
                    <span style={{ color: d.debtType === 'CREDIT' ? 'var(--accent-emerald)' : 'var(--accent-danger)', fontWeight: '700' }}>
                      {d.debtType}
                    </span>
                  </td>
                  <td>
                    <button
                      onClick={() => toggleDebtStatus(d.id)}
                      style={{
                        background: d.status === 'PAID' ? 'var(--accent-emerald-glow)' : 'rgba(255, 255, 255, 0.04)',
                        border: d.status === 'PAID' ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid var(--border-subtle)',
                        color: d.status === 'PAID' ? 'var(--accent-emerald)' : 'var(--text-muted)',
                        padding: '0.35rem 0.85rem',
                        borderRadius: '9999px',
                        fontSize: '0.75rem',
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

      {/* 4. WALLETS TAB */}
      {activeTab === 'wallets' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: '700', color: 'var(--text-heading)' }}>Your Financial Accounts & Wallets</h3>
            <Button variant="secondary" onClick={() => setShowAddWallet(!showAddWallet)}>+ Create New Wallet</Button>
          </div>

          {showAddWallet && (
            <form onSubmit={handleAddWallet} style={{ background: 'rgba(0,0,0,0.3)', padding: '1rem', borderRadius: 'var(--radius-md)', marginBottom: '1.5rem', display: 'flex', gap: '0.75rem' }}>
              <input type="text" placeholder="Wallet Name (e.g. Bank, Cash)" value={walletName} onChange={e => setWalletName(e.target.value)} style={{ flex: 1, padding: '0.5rem', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-subtle)', color: '#FFF', borderRadius: '6px' }} required />
              <input type="number" placeholder="Initial Balance" value={initialBalance} onChange={e => setInitialBalance(e.target.value)} style={{ width: '130px', padding: '0.5rem', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-subtle)', color: '#FFF', borderRadius: '6px' }} />
              <Button type="submit">Create Wallet</Button>
            </form>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.25rem' }}>
            {wallets.map(w => (
              <motion.div key={w.id} whileHover={{ scale: 1.02 }} style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border-highlight)', borderRadius: 'var(--radius-md)', padding: '1.5rem' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Account Wallet</div>
                <h4 style={{ fontSize: '1.1rem', fontWeight: '700', color: 'var(--text-heading)', marginBottom: '0.75rem' }}>{w.name}</h4>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1.6rem', fontWeight: '800', color: 'var(--accent-amber)' }}>
                  ${Number(w.balance).toFixed(2)}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </Card>
  );
};
