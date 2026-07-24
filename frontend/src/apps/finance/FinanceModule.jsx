import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { client } from '../../api/client';

/**
 * Ultra-Spacious, Decluttered Naqashly Ledger Application.
 * Designed with generous whitespace, Linear/Vercel-grade layout geometry, and fluid motion.
 * 
 * @author Barkat Bashir
 * @version 4.0.0
 */
export const FinanceModule = () => {
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'transactions' | 'debts' | 'wallets'
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
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem', width: '100%', maxWidth: '1280px', margin: '0 auto', paddingBottom: '4rem' }}>
      
      {/* 1. HERO NET WORTH & QUICK ACTION HEADER (Spacious & Airy Layout) */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '2rem', alignItems: 'stretch' }}>
        
        {/* Net Worth Hero Card */}
        <div style={{
          background: 'linear-gradient(135deg, rgba(15, 21, 33, 0.9) 0%, rgba(20, 27, 44, 0.9) 100%)',
          border: '1px solid var(--border-highlight)',
          borderRadius: 'var(--radius-lg)',
          padding: '2.5rem',
          backdropFilter: 'blur(20px)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          boxShadow: '0 20px 40px rgba(0,0,0,0.4)'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.75rem' }}>
              <span style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--accent-amber)', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                💰 Naqashly Ledger Suite
              </span>
              <Badge variant="amber">Live Database</Badge>
            </div>
            <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Total Liquid Net Worth</div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '3.2rem', fontWeight: '800', color: 'var(--text-heading)', letterSpacing: '-0.03em', lineHeight: 1.1 }}>
              ${totalWalletBalance.toFixed(2)}
            </div>
          </div>

          <div style={{ display: 'flex', gap: '2.5rem', marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border-subtle)' }}>
            <div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Money Owed To You</div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1.35rem', fontWeight: '700', color: 'var(--accent-emerald)' }}>
                +${netCreditSum.toFixed(2)}
              </div>
            </div>
            <div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Money You Owe</div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1.35rem', fontWeight: '700', color: 'var(--accent-danger)' }}>
                -${netDebitSum.toFixed(2)}
              </div>
            </div>
            <div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Connected Wallets</div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1.35rem', fontWeight: '700', color: 'var(--text-heading)' }}>
                {wallets.length} Accounts
              </div>
            </div>
          </div>
        </div>

        {/* Quick Action & Controls Card */}
        <div style={{
          background: 'rgba(12, 16, 26, 0.6)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-lg)',
          padding: '2.5rem',
          backdropFilter: 'blur(20px)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          gap: '1.25rem'
        }}>
          <div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: '700', color: 'var(--text-heading)', marginBottom: '0.35rem' }}>
              Quick Ledger Actions
            </h3>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
              Record financial entries or track interpersonal debt settlements in seconds.
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            <Button variant="emerald" onClick={() => setShowAddTx(!showAddTx)} style={{ padding: '0.9rem 1.25rem', fontSize: '0.92rem', justifyContent: 'center' }}>
              {showAddTx ? '✕ Close Form' : '💸 + Log Expense or Income'}
            </Button>
            <Button variant="secondary" onClick={() => setShowAddDebt(!showAddDebt)} style={{ padding: '0.9rem 1.25rem', fontSize: '0.92rem', justifyContent: 'center' }}>
              {showAddDebt ? '✕ Close Form' : '🤝 + Add Debt Record'}
            </Button>
          </div>
        </div>
      </div>

      {/* 2. SLIDE-DOWN MODAL FORMS (Spacious & Clean Inputs) */}
      <AnimatePresence>
        {showAddTx && (
          <motion.div
            initial={{ opacity: 0, scale: 0.98, y: -15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98, y: -15 }}
            style={{
              background: '#0E131F',
              border: '1px solid var(--border-highlight)',
              borderRadius: 'var(--radius-lg)',
              padding: '2.5rem',
              boxShadow: '0 25px 50px rgba(0,0,0,0.7)'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.75rem' }}>
              <div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: '700', color: 'var(--text-heading)', marginBottom: '0.25rem' }}>
                  💸 Record Financial Transaction
                </h3>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                  Saves directly to PostgreSQL naqashly_finance_db and updates wallet balance.
                </p>
              </div>
              <Button variant="secondary" onClick={() => setShowAddTx(false)}>✕ Close</Button>
            </div>

            <form onSubmit={handleAddTx} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem' }}>
                {/* Type Selection */}
                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: '600', color: 'var(--text-muted)', display: 'block', marginBottom: '0.5rem' }}>Transaction Type</label>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button
                      type="button"
                      onClick={() => setTxType('EXPENSE')}
                      style={{
                        flex: 1, padding: '0.75rem', borderRadius: '10px', border: 'none',
                        background: txType === 'EXPENSE' ? 'var(--accent-danger)' : 'rgba(255,255,255,0.05)',
                        color: '#FFF', fontWeight: '700', fontSize: '0.88rem', cursor: 'pointer'
                      }}
                    >
                      - EXPENSE
                    </button>
                    <button
                      type="button"
                      onClick={() => setTxType('INCOME')}
                      style={{
                        flex: 1, padding: '0.75rem', borderRadius: '10px', border: 'none',
                        background: txType === 'INCOME' ? 'var(--accent-emerald)' : 'rgba(255,255,255,0.05)',
                        color: '#FFF', fontWeight: '700', fontSize: '0.88rem', cursor: 'pointer'
                      }}
                    >
                      + INCOME
                    </button>
                  </div>
                </div>

                {/* Amount Input */}
                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: '600', color: 'var(--text-muted)', display: 'block', marginBottom: '0.5rem' }}>Amount ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={txAmount}
                    onChange={e => setTxAmount(e.target.value)}
                    style={{ width: '100%', padding: '0.75rem', background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border-subtle)', color: '#FFF', borderRadius: '10px', fontSize: '1rem', fontFamily: 'var(--font-mono)' }}
                    required
                  />
                </div>

                {/* Category Dropdown */}
                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: '600', color: 'var(--text-muted)', display: 'block', marginBottom: '0.5rem' }}>Category</label>
                  <select
                    value={category}
                    onChange={e => setCategory(e.target.value)}
                    style={{ width: '100%', padding: '0.75rem', background: '#080B11', border: '1px solid var(--border-subtle)', color: '#FFF', borderRadius: '10px', fontSize: '0.9rem' }}
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

              {/* Rich Note & Context Input Field */}
              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: '600', color: 'var(--text-muted)', display: 'block', marginBottom: '0.5rem' }}>
                  📝 Rich Note & Context (Why, What, With Whom)
                </label>
                <input
                  type="text"
                  placeholder="e.g., Team lunch at Cafe with Tariq & Bilal (Project Review)"
                  value={noteContent}
                  onChange={e => setNoteContent(e.target.value)}
                  style={{ width: '100%', padding: '0.85rem', background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border-subtle)', color: '#FFF', borderRadius: '10px', fontSize: '0.92rem' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '0.5rem' }}>
                <Button variant="secondary" onClick={() => setShowAddTx(false)}>Cancel</Button>
                <Button type="submit" style={{ padding: '0.85rem 1.75rem', fontSize: '0.95rem' }}>Confirm & Save Entry →</Button>
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
            style={{ background: 'rgba(0,0,0,0.4)', border: '1px solid var(--border-highlight)', padding: '2rem', borderRadius: 'var(--radius-lg)', display: 'flex', gap: '1.25rem', alignItems: 'center' }}
          >
            <input
              type="text"
              placeholder="Contact Person Name"
              value={personName}
              onChange={e => setPersonName(e.target.value)}
              style={{ flex: 1, padding: '0.75rem', background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border-subtle)', color: '#FFF', borderRadius: '10px' }}
              required
            />
            <input
              type="number"
              placeholder="Amount ($)"
              value={debtAmount}
              onChange={e => setDebtAmount(e.target.value)}
              style={{ width: '160px', padding: '0.75rem', background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border-subtle)', color: '#FFF', borderRadius: '10px' }}
              required
            />
            <select
              value={debtType}
              onChange={e => setDebtType(e.target.value)}
              style={{ padding: '0.75rem', background: '#0E131F', border: '1px solid var(--border-subtle)', color: '#FFF', borderRadius: '10px' }}
            >
              <option value="CREDIT">CREDIT (Money You Lent)</option>
              <option value="DEBIT">DEBIT (Money You Owe)</option>
            </select>
            <Button type="submit" style={{ padding: '0.75rem 1.5rem' }}>Save Debt Record</Button>
          </motion.form>
        )}
      </AnimatePresence>

      {/* 3. SPACIOUS NAVIGATION SUB-TABS */}
      <div style={{ display: 'flex', gap: '0.75rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '1rem' }}>
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
              padding: '0.65rem 1.35rem',
              borderRadius: 'var(--radius-md)',
              fontSize: '0.92rem',
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

      {/* 4. SUB-TAB CONTENTS (Spacious Tables & Airy Cards) */}

      {/* OVERVIEW TAB */}
      {activeTab === 'overview' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '2.5rem' }}>
          {/* Recent Transactions Card */}
          <div style={{ background: 'rgba(12, 16, 26, 0.5)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-lg)', padding: '2rem' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: '700', color: 'var(--text-heading)', marginBottom: '1.5rem' }}>
              📑 Recent Income & Expense Logs
            </h3>
            {transactions.length === 0 ? (
              <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)' }}>No transactions logged yet.</p>
            ) : (
              transactions.slice(0, 4).map(t => (
                <div key={t.id} style={{ background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.04)', padding: '1.25rem', borderRadius: 'var(--radius-md)', marginBottom: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontWeight: '600', color: 'var(--text-heading)', fontSize: '0.95rem' }}>{t.description || t.category}</div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>{t.category}</div>
                  </div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontWeight: '700', fontSize: '1.1rem', color: t.transactionType === 'INCOME' ? 'var(--accent-emerald)' : 'var(--accent-danger)' }}>
                    {t.transactionType === 'INCOME' ? '+' : '-'}${Number(t.amount).toFixed(2)}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Debt Highlights Card */}
          <div style={{ background: 'rgba(12, 16, 26, 0.5)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-lg)', padding: '2rem' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: '700', color: 'var(--text-heading)', marginBottom: '1.5rem' }}>
              🤝 Debt Settlement Highlights
            </h3>
            {debts.length === 0 ? (
              <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)' }}>No debt records found.</p>
            ) : (
              debts.slice(0, 4).map(d => (
                <div key={d.id} style={{ background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.04)', padding: '1.25rem', borderRadius: 'var(--radius-md)', marginBottom: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontWeight: '600', color: 'var(--text-heading)', fontSize: '0.95rem' }}>{d.personName}</div>
                    <div style={{ fontSize: '0.78rem', color: d.debtType === 'CREDIT' ? 'var(--accent-emerald)' : 'var(--accent-danger)', fontWeight: '700', marginTop: '0.2rem' }}>
                      {d.debtType} (${Number(d.amount).toFixed(2)})
                    </div>
                  </div>
                  <Button variant="outline" onClick={() => toggleDebtStatus(d.id)} style={{ fontSize: '0.8rem', padding: '0.4rem 0.9rem' }}>
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
        <div style={{ background: 'rgba(12, 16, 26, 0.5)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-lg)', padding: '2.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
            <div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: '700', color: 'var(--text-heading)' }}>Income & Expense History</h3>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>All financial transactions saved in PostgreSQL naqashly_finance_db.</p>
            </div>
            <Button variant="emerald" onClick={() => setShowAddTx(true)}>+ Log Expense / Income</Button>
          </div>

          {loading ? (
            <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Fetching live transactions...</div>
          ) : transactions.length === 0 ? (
            <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>No transaction history found.</div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '0 0.75rem', fontSize: '0.9rem' }}>
              <thead>
                <tr>
                  <th style={{ textAlign: 'left', color: 'var(--text-muted)', padding: '0 1rem 0.75rem', fontWeight: '600' }}>Note & Context (Why, What, With Whom)</th>
                  <th style={{ textAlign: 'left', color: 'var(--text-muted)', padding: '0 1rem 0.75rem', fontWeight: '600' }}>Category</th>
                  <th style={{ textAlign: 'left', color: 'var(--text-muted)', padding: '0 1rem 0.75rem', fontWeight: '600' }}>Amount</th>
                  <th style={{ textAlign: 'left', color: 'var(--text-muted)', padding: '0 1rem 0.75rem', fontWeight: '600' }}>Type</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map(t => (
                  <tr key={t.id} style={{ background: 'rgba(0,0,0,0.25)', borderRadius: '10px' }}>
                    <td style={{ padding: '1.1rem 1rem', color: 'var(--text-heading)', borderTopLeftRadius: '10px', borderBottomLeftRadius: '10px' }}>
                      {t.description || 'General Log'}
                    </td>
                    <td style={{ padding: '1.1rem 1rem', color: 'var(--text-muted)' }}>{t.category}</td>
                    <td style={{ padding: '1.1rem 1rem', fontFamily: 'var(--font-mono)', fontWeight: '700', fontSize: '1rem', color: t.transactionType === 'INCOME' ? 'var(--accent-emerald)' : 'var(--accent-danger)' }}>
                      {t.transactionType === 'INCOME' ? '+' : '-'}${Number(t.amount).toFixed(2)}
                    </td>
                    <td style={{ padding: '1.1rem 1rem', borderTopRightRadius: '10px', borderBottomRightRadius: '10px' }}>
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
        <div style={{ background: 'rgba(12, 16, 26, 0.5)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-lg)', padding: '2.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
            <div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: '700', color: 'var(--text-heading)' }}>Interpersonal Debt Ledger (/debts)</h3>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Track credit (lent) vs debit (borrowed) and toggle settlement status.</p>
            </div>
            <Button variant="secondary" onClick={() => setShowAddDebt(true)}>+ Add Debt Record</Button>
          </div>

          <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '0 0.75rem', fontSize: '0.9rem' }}>
            <thead>
              <tr>
                <th style={{ textAlign: 'left', color: 'var(--text-muted)', padding: '0 1rem 0.75rem', fontWeight: '600' }}>Contact Person</th>
                <th style={{ textAlign: 'left', color: 'var(--text-muted)', padding: '0 1rem 0.75rem', fontWeight: '600' }}>Amount</th>
                <th style={{ textAlign: 'left', color: 'var(--text-muted)', padding: '0 1rem 0.75rem', fontWeight: '600' }}>Type</th>
                <th style={{ textAlign: 'left', color: 'var(--text-muted)', padding: '0 1rem 0.75rem', fontWeight: '600' }}>Settlement Toggle</th>
              </tr>
            </thead>
            <tbody>
              {debts.map(d => (
                <tr key={d.id} style={{ background: 'rgba(0,0,0,0.25)', borderRadius: '10px' }}>
                  <td style={{ padding: '1.1rem 1rem', color: 'var(--text-heading)', fontWeight: '600', borderTopLeftRadius: '10px', borderBottomLeftRadius: '10px' }}>
                    {d.personName}
                  </td>
                  <td style={{ padding: '1.1rem 1rem', fontFamily: 'var(--font-mono)', fontWeight: '700', fontSize: '1rem', color: 'var(--text-heading)' }}>
                    ${Number(d.amount).toFixed(2)}
                  </td>
                  <td style={{ padding: '1.1rem 1rem' }}>
                    <span style={{ color: d.debtType === 'CREDIT' ? 'var(--accent-emerald)' : 'var(--accent-danger)', fontWeight: '700' }}>
                      {d.debtType}
                    </span>
                  </td>
                  <td style={{ padding: '1.1rem 1rem', borderTopRightRadius: '10px', borderBottomRightRadius: '10px' }}>
                    <button
                      onClick={() => toggleDebtStatus(d.id)}
                      style={{
                        background: d.status === 'PAID' ? 'var(--accent-emerald-glow)' : 'rgba(255, 255, 255, 0.04)',
                        border: d.status === 'PAID' ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid var(--border-subtle)',
                        color: d.status === 'PAID' ? 'var(--accent-emerald)' : 'var(--text-muted)',
                        padding: '0.45rem 1.1rem',
                        borderRadius: '9999px',
                        fontSize: '0.8rem',
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
        <div style={{ background: 'rgba(12, 16, 26, 0.5)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-lg)', padding: '2.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
            <div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: '700', color: 'var(--text-heading)' }}>Financial Accounts & Wallets</h3>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Manage bank accounts, cash wallets, and crypto vaults.</p>
            </div>
            <Button variant="secondary" onClick={() => setShowAddWallet(!showAddWallet)}>+ Create New Wallet</Button>
          </div>

          {showAddWallet && (
            <form onSubmit={handleAddWallet} style={{ background: 'rgba(0,0,0,0.3)', padding: '1.5rem', borderRadius: 'var(--radius-md)', marginBottom: '2rem', display: 'flex', gap: '1rem' }}>
              <input type="text" placeholder="Wallet Name (e.g. Bank, Cash)" value={walletName} onChange={e => setWalletName(e.target.value)} style={{ flex: 1, padding: '0.75rem', background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border-subtle)', color: '#FFF', borderRadius: '8px' }} required />
              <input type="number" placeholder="Initial Balance" value={initialBalance} onChange={e => setInitialBalance(e.target.value)} style={{ width: '160px', padding: '0.75rem', background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border-subtle)', color: '#FFF', borderRadius: '8px' }} />
              <Button type="submit" style={{ padding: '0.75rem 1.5rem' }}>Create Wallet</Button>
            </form>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '2rem' }}>
            {wallets.map(w => (
              <motion.div key={w.id} whileHover={{ y: -4 }} style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border-highlight)', borderRadius: 'var(--radius-md)', padding: '2rem' }}>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '0.35rem' }}>Account Wallet</div>
                <h4 style={{ fontSize: '1.2rem', fontWeight: '700', color: 'var(--text-heading)', marginBottom: '1rem' }}>{w.name}</h4>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '2rem', fontWeight: '800', color: 'var(--accent-amber)' }}>
                  ${Number(w.balance).toFixed(2)}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
};
