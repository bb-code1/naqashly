import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { useAuth } from '../../context/AuthContext';

/**
 * Tabbed Login & Registration Glassmorphic Modal Window.
 */
export const AuthModal = ({ isOpen, onClose }) => {
  const [tab, setTab] = useState('login'); // 'login' | 'register'
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const { login, register } = useAuth();

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    setLoading(true);

    try {
      if (tab === 'login') {
        await login(email, password);
        setSuccessMsg('Logged in successfully!');
        setTimeout(() => {
          onClose();
        }, 600);
      } else {
        await register(username, email, password);
        setSuccessMsg('Account created successfully! Switch to Login.');
        setTab('login');
      }
    } catch (err) {
      console.error('[AuthModal] Auth error:', err);
      const msg = err.response?.data?.message || err.message || 'Authentication failed';
      setErrorMsg(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={tab === 'login' ? '🔐 User Login' : '✨ Create Account'}>
      <div style={{ display: 'flex', borderBottom: '1px solid var(--border-subtle)', marginBottom: '1.25rem' }}>
        <button
          onClick={() => { setTab('login'); setErrorMsg(''); setSuccessMsg(''); }}
          style={{
            flex: 1, padding: '0.6rem', background: 'transparent', border: 'none',
            borderBottom: tab === 'login' ? '2px solid var(--accent-indigo)' : 'none',
            color: tab === 'login' ? 'var(--text-heading)' : 'var(--text-muted)',
            fontWeight: '600', cursor: 'pointer'
          }}
        >
          Log In
        </button>
        <button
          onClick={() => { setTab('register'); setErrorMsg(''); setSuccessMsg(''); }}
          style={{
            flex: 1, padding: '0.6rem', background: 'transparent', border: 'none',
            borderBottom: tab === 'register' ? '2px solid var(--accent-indigo)' : 'none',
            color: tab === 'register' ? 'var(--text-heading)' : 'var(--text-muted)',
            fontWeight: '600', cursor: 'pointer'
          }}
        >
          Sign Up
        </button>
      </div>

      {errorMsg && (
        <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', color: '#EF4444', padding: '0.5rem', borderRadius: '6px', fontSize: '0.8rem', marginBottom: '1rem' }}>
          {errorMsg}
        </div>
      )}

      {successMsg && (
        <div style={{ background: 'var(--accent-emerald-glow)', border: '1px solid rgba(16, 185, 129, 0.3)', color: 'var(--accent-emerald)', padding: '0.5rem', borderRadius: '6px', fontSize: '0.8rem', marginBottom: '1rem' }}>
          {successMsg}
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
        {tab === 'register' && (
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={e => setUsername(e.target.value)}
            style={{ padding: '0.65rem', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-subtle)', color: '#FFF', borderRadius: '8px' }}
            required
          />
        )}

        <input
          type="email"
          placeholder="Email Address"
          value={email}
          onChange={e => setEmail(e.target.value)}
          style={{ padding: '0.65rem', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-subtle)', color: '#FFF', borderRadius: '8px' }}
          required
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          style={{ padding: '0.65rem', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-subtle)', color: '#FFF', borderRadius: '8px' }}
          required
        />

        <Button type="submit" disabled={loading} style={{ marginTop: '0.5rem' }}>
          {loading ? 'Processing...' : tab === 'login' ? 'Log In to Naqashly' : 'Create Account'}
        </Button>
      </form>
    </Modal>
  );
};
