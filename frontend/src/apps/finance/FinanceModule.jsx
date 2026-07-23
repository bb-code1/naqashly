import React, { useState, useEffect } from 'react';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { client } from '../../api/client';

export const FinanceModule = () => {
  const [debts, setDebts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [personName, setPersonName] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState('CREDIT');
  const [showAddForm, setShowAddForm] = useState(false);

  const fetchDebts = () => {
    setLoading(true);
    client.get('/finance/debts')
      .then(res => {
        setDebts(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error('[FinanceModule] Error fetching live debts:', err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchDebts();
  }, []);

  const handleAddDebt = (e) => {
    e.preventDefault();
    if (!personName || !amount) return;

    client.post('/finance/debts', {
      personName,
      amount: parseFloat(amount),
      type,
      notes: 'Logged via Web Dashboard'
    }).then(() => {
      setPersonName('');
      setAmount('');
      setShowAddForm(false);
      fetchDebts(); // Refresh live PostgreSQL data
    }).catch(err => console.error('[FinanceModule] Error adding debt:', err));
  };

  const toggleDebt = (id) => {
    client.put(`/finance/debts/${id}/toggle`)
      .then(res => {
        setDebts(prev => prev.map(d => (d.id === id ? res.data : d)));
      })
      .catch(err => console.error('[FinanceModule] Error toggling debt status:', err));
  };

  const netCredit = debts
    .filter(d => d.debtType === 'CREDIT')
    .reduce((acc, d) => acc + Number(d.amount), 0);

  return (
    <Card className="col-8">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div style={{ fontSize: '1.05rem', fontWeight: '700', color: 'var(--text-heading)', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          💰 Personal Finance & Debt Ledger
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Badge variant="amber">finance-service :8082</Badge>
          <Button variant="secondary" onClick={() => setShowAddForm(!showAddForm)}>
            {showAddForm ? 'Close' : '+ Add Debt Record'}
          </Button>
        </div>
      </div>

      {showAddForm && (
        <form onSubmit={handleAddDebt} style={{ background: 'rgba(0,0,0,0.3)', padding: '1rem', borderRadius: 'var(--radius-md)', marginBottom: '1.5rem', display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <input
            type="text"
            placeholder="Contact Person Name"
            value={personName}
            onChange={e => setPersonName(e.target.value)}
            style={{ flex: 1, padding: '0.5rem', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-subtle)', color: '#FFF', borderRadius: '6px' }}
            required
          />
          <input
            type="number"
            placeholder="Amount ($)"
            value={amount}
            onChange={e => setAmount(e.target.value)}
            style={{ width: '120px', padding: '0.5rem', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-subtle)', color: '#FFF', borderRadius: '6px' }}
            required
          />
          <select
            value={type}
            onChange={e => setType(e.target.value)}
            style={{ padding: '0.5rem', background: '#0E131F', border: '1px solid var(--border-subtle)', color: '#FFF', borderRadius: '6px' }}
          >
            <option value="CREDIT">CREDIT (Lent)</option>
            <option value="DEBIT">DEBIT (Borrowed)</option>
          </select>
          <Button type="submit">Save</Button>
        </form>
      )}

      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
        <div style={{ flex: 1, background: 'rgba(0, 0, 0, 0.25)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', padding: '1.1rem' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.35rem' }}>Live Credit Sum</div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1.5rem', fontWeight: '800', color: 'var(--accent-amber)' }}>
            ${netCredit.toFixed(2)}
          </div>
        </div>

        <div style={{ flex: 1, background: 'rgba(0, 0, 0, 0.25)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', padding: '1.1rem' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.35rem' }}>Total Debt Entries in PostgreSQL</div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1.5rem', fontWeight: '800', color: 'var(--accent-emerald)' }}>
            {debts.length} Records
          </div>
        </div>
      </div>

      {loading ? (
        <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Fetching live data from PostgreSQL via Gateway...</div>
      ) : debts.length === 0 ? (
        <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>No debt records found. Click "+ Add Debt Record" above to save one!</div>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
              <th style={{ textAlign: 'left', color: 'var(--text-muted)', paddingBottom: '0.75rem' }}>Contact Person</th>
              <th style={{ textAlign: 'left', color: 'var(--text-muted)', paddingBottom: '0.75rem' }}>Amount</th>
              <th style={{ textAlign: 'left', color: 'var(--text-muted)', paddingBottom: '0.75rem' }}>Type</th>
              <th style={{ textAlign: 'left', color: 'var(--text-muted)', paddingBottom: '0.75rem' }}>Status</th>
            </tr>
          </thead>
          <tbody>
            {debts.map(d => (
              <tr key={d.id} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.03)' }}>
                <td style={{ padding: '0.85rem 0', color: 'var(--text-heading)' }}>{d.personName}</td>
                <td style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-heading)' }}>${Number(d.amount).toFixed(2)}</td>
                <td>
                  <span style={{ color: d.debtType === 'CREDIT' ? 'var(--accent-emerald)' : '#EF4444', fontWeight: '600' }}>
                    {d.debtType}
                  </span>
                </td>
                <td>
                  <button
                    onClick={() => toggleDebt(d.id)}
                    style={{
                      background: d.status === 'PAID' ? 'var(--accent-emerald-glow)' : 'rgba(255, 255, 255, 0.04)',
                      border: d.status === 'PAID' ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid var(--border-subtle)',
                      color: d.status === 'PAID' ? 'var(--accent-emerald)' : 'var(--text-muted)',
                      padding: '0.3rem 0.75rem',
                      borderRadius: '9999px',
                      fontSize: '0.75rem',
                      fontWeight: '600',
                      cursor: 'pointer'
                    }}
                  >
                    {d.status}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </Card>
  );
};
