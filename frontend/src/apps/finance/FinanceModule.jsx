import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { client } from '../../api/client';

/**
 * Modern Sleek Framer Motion Personal Ledger Application ("Naqashly Ledger").
 * 
 * Features:
 * - Multi-Wallet Account Hub (/wallets)
 * - Income & Expense Transaction Tracker (/transactions)
 * - Interpersonal Debt & Credit Settlement Ledger (/debts)
 * - Framer Motion 60 FPS spring physics animations & smooth tab transitions
 * 
 * @author Barkat Bashir
 * @version 2.0.0
 */
export const FinanceModule = () => {
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'wallets' | 'transactions' | 'debts'
  const [debts, setDebts] = useState([]);
  const [wallets, setWallets] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modals & Form States
  const [showAddDebt, setShowAddDebt] = useState(false);
  const [showAddWallet, setShowAddWallet] = useState(false);
  const [showAddTx, setShowAddTx] = useState(false);

  // Form Field Inputs
  const [personName, setPersonName] = useState('');
  const [debtAmount, setDebtAmount] = useState('');
  const [debtType, setDebtType] = useState('CREDIT');

  const [walletName, setWalletName] = useState('');
  const [currency, setCurrency] = useState('USD');
  const [initialBalance, setInitialBalance] = useState('');

  const [txAmount, setTxAmount] = useState('');
  const [txType, setTxType] = useState('EXPENSE');
  const [category, setCategory] = useState('FOOD');
  const [description, setDescription] = useState('');

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
      if (walletsRes.status === 'fulfilled') setWallets(walletsRes.value.data);
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
        currency,
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

  const handleAddTx = async (e) => {
    e.preventDefault();
    if (!txAmount || wallets.length === 0) return;
    try {
      await client.post('/finance/transactions', {
        walletId: wallets[0].id,
        amount: parseFloat(txAmount),
        type: txType,
        category,
        description
      });
      setTxAmount('');
      setDescription('');
      setShowAddTx(false);
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
    <Card className="col-12" style={{ border: '1px solid var(--border-highlight)' }}>
      {/* Header Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{
            width: '42px', height: '42px', borderRadius: '12px',
            background: 'linear-gradient(135deg, var(--accent-amber) 0%, #D97706 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '1.25rem', boxShadow: '0 0 24px rgba(245, 158, 11, 0.25)'
          }}>
            💰
          </div>
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: '800', color: 'var(--text-heading)', letterSpacing: '-0.02em' }}>
              Naqashly Ledger & Personal Finance
            </h2>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Multi-wallet balances, income/expense tracker & interpersonal debt ledger
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Badge variant="amber">finance-service :8082</Badge>
          <Button onClick={() => setShowAddDebt(!showAddDebt)}>
            {showAddDebt ? 'X Close' : '+ Add Debt Record'}
          </Button>
        </div>
      </div>

      {/* Net Worth Summary Stats Banner */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '2rem' }}>
        <motion.div whileHover={{ y: -3 }} transition={{ type: 'spring', stiffness: 300 }} style={{ background: 'rgba(0, 0, 0, 0.3)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', padding: '1.25rem' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.35rem' }}>Total Liquid Net Worth</div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1.65rem', fontWeight: '800', color: 'var(--accent-amber)' }}>
            ${totalWalletBalance.toFixed(2)}
          </div>
        </motion.div>

        <motion.div whileHover={{ y: -3 }} transition={{ type: 'spring', stiffness: 300 }} style={{ background: 'rgba(0, 0, 0, 0.3)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', padding: '1.25rem' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.35rem' }}>Money Owed To You (Credit)</div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1.65rem', fontWeight: '800', color: 'var(--accent-emerald)' }}>
            ${netCreditSum.toFixed(2)}
          </div>
        </motion.div>

        <motion.div whileHover={{ y: -3 }} transition={{ type: 'spring', stiffness: 300 }} style={{ background: 'rgba(0, 0, 0, 0.3)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', padding: '1.25rem' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.35rem' }}>Money You Owe (Debit)</div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1.65rem', fontWeight: '800', color: 'var(--accent-danger)' }}>
            ${netDebitSum.toFixed(2)}
          </div>
        </motion.div>

        <motion.div whileHover={{ y: -3 }} transition={{ type: 'spring', stiffness: 300 }} style={{ background: 'rgba(0, 0, 0, 0.3)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', padding: '1.25rem' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.35rem' }}>Connected Wallets</div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1.65rem', fontWeight: '800', color: 'var(--accent-indigo)' }}>
            {wallets.length} Accounts
          </div>
        </motion.div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.85rem', marginBottom: '1.75rem' }}>
        {[
          { key: 'overview', label: '📊 Overview' },
          { key: 'wallets', label: '💳 Multi-Wallet Hub' },
          { key: 'transactions', label: '📑 Income & Expenses' },
          { key: 'debts', label: '🤝 Debt Ledger (/debts)' }
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

      {/* Modals & Slide Forms */}
      <AnimatePresence>
        {showAddDebt && (
          <motion.form
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            onSubmit={handleAddDebt}
            style={{ background: 'rgba(0,0,0,0.4)', border: '1px solid var(--border-highlight)', padding: '1.25rem', borderRadius: 'var(--radius-md)', marginBottom: '1.75rem', display: 'flex', gap: '0.85rem', alignItems: 'center' }}
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
            <Button type="submit">Save Record</Button>
          </motion.form>
        )}
      </AnimatePresence>

      {/* SUB-TAB CONTENTS */}
      {activeTab === 'overview' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.5rem' }}>
          <div>
            <h3 style={{ fontSize: '1rem', fontWeight: '700', color: 'var(--text-heading)', marginBottom: '1rem' }}>
              💳 Active Wallets Summary
            </h3>
            {wallets.length === 0 ? (
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>No wallets found. Create one under "Multi-Wallet Hub".</p>
            ) : (
              wallets.map(w => (
                <div key={w.id} style={{ background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border-subtle)', padding: '1rem', borderRadius: 'var(--radius-md)', marginBottom: '0.75rem', display: 'flex', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ fontWeight: '600', color: 'var(--text-heading)' }}>{w.name}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{w.currency || 'USD'} Wallet</div>
                  </div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontWeight: '700', color: 'var(--accent-amber)' }}>
                    ${Number(w.balance).toFixed(2)}
                  </div>
                </div>
              ))
            )}
          </div>

          <div>
            <h3 style={{ fontSize: '1rem', fontWeight: '700', color: 'var(--text-heading)', marginBottom: '1rem' }}>
              🤝 Debt Settlement Highlights
            </h3>
            {debts.length === 0 ? (
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>No debt records found.</p>
            ) : (
              debts.slice(0, 3).map(d => (
                <div key={d.id} style={{ background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border-subtle)', padding: '1rem', borderRadius: 'var(--radius-md)', marginBottom: '0.75rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontWeight: '600', color: 'var(--text-heading)' }}>{d.personName}</div>
                    <span style={{ fontSize: '0.72rem', color: d.debtType === 'CREDIT' ? 'var(--accent-emerald)' : 'var(--accent-danger)' }}>{d.debtType}</span>
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

      {/* TAB 2: MULTI-WALLET HUB */}
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

      {/* TAB 3: INCOME & EXPENSES */}
      {activeTab === 'transactions' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: '700', color: 'var(--text-heading)' }}>Income & Expense Transaction History</h3>
            <Button variant="secondary" onClick={() => setShowAddTx(!showAddTx)}>+ Log Transaction</Button>
          </div>

          {showAddTx && (
            <form onSubmit={handleAddTx} style={{ background: 'rgba(0,0,0,0.3)', padding: '1rem', borderRadius: 'var(--radius-md)', marginBottom: '1.5rem', display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
              <input type="number" placeholder="Amount ($)" value={txAmount} onChange={e => setTxAmount(e.target.value)} style={{ width: '120px', padding: '0.5rem', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-subtle)', color: '#FFF', borderRadius: '6px' }} required />
              <select value={txType} onChange={e => setTxType(e.target.value)} style={{ padding: '0.5rem', background: '#0E131F', border: '1px solid var(--border-subtle)', color: '#FFF', borderRadius: '6px' }}>
                <option value="EXPENSE">EXPENSE (-)</option>
                <option value="INCOME">INCOME (+)</option>
              </select>
              <input type="text" placeholder="Description (e.g. Coffee, Salary)" value={description} onChange={e => setDescription(e.target.value)} style={{ flex: 1, padding: '0.5rem', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-subtle)', color: '#FFF', borderRadius: '6px' }} />
              <Button type="submit">Log Entry</Button>
            </form>
          )}

          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                <th style={{ textAlign: 'left', color: 'var(--text-muted)', paddingBottom: '0.75rem' }}>Description</th>
                <th style={{ textAlign: 'left', color: 'var(--text-muted)', paddingBottom: '0.75rem' }}>Category</th>
                <th style={{ textAlign: 'left', color: 'var(--text-muted)', paddingBottom: '0.75rem' }}>Amount</th>
                <th style={{ textAlign: 'left', color: 'var(--text-muted)', paddingBottom: '0.75rem' }}>Type</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map(t => (
                <tr key={t.id} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.03)' }}>
                  <td style={{ padding: '0.85rem 0', color: 'var(--text-heading)' }}>{t.description || 'Transaction'}</td>
                  <td style={{ color: 'var(--text-muted)' }}>{t.category}</td>
                  <td style={{ fontFamily: 'var(--font-mono)', fontWeight: '700', color: t.type === 'INCOME' ? 'var(--accent-emerald)' : 'var(--accent-danger)' }}>
                    {t.type === 'INCOME' ? '+' : '-'}${Number(t.amount).toFixed(2)}
                  </td>
                  <td>
                    <Badge variant={t.type === 'INCOME' ? 'emerald' : 'amber'}>{t.type}</Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* TAB 4: DEBT LEDGER (/debts) */}
      {activeTab === 'debts' && (
        <div>
          <h3 style={{ fontSize: '1rem', fontWeight: '700', color: 'var(--text-heading)', marginBottom: '1.25rem' }}>
            Interpersonal Debt & Credit Ledger (/debts)
          </h3>

          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                <th style={{ textAlign: 'left', color: 'var(--text-muted)', paddingBottom: '0.75rem' }}>Contact Person</th>
                <th style={{ textAlign: 'left', color: 'var(--text-muted)', paddingBottom: '0.75rem' }}>Amount</th>
                <th style={{ textAlign: 'left', color: 'var(--text-muted)', paddingBottom: '0.75rem' }}>Type</th>
                <th style={{ textAlign: 'left', color: 'var(--text-muted)', paddingBottom: '0.75rem' }}>Status Toggle</th>
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
    </Card>
  );
};
