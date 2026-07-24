import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { useAuth } from '../../context/AuthContext';

/**
 * Tabbed Login & Registration Glassmorphic Modal Window.
 * 100% Theme-Aware supporting Obsidian Dark, Luxe Light, Cyberpunk, and Forest modes.
 * 
 * @author Barkat Bashir
 * @version 3.0.0
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
        }, 500);
      } else {
        await register(username || email.split('@')[0], email, password);
        setSuccessMsg('Account created successfully! Switching to Login...');
        setTimeout(() => {
          setTab('login');
          setSuccessMsg('');
        }, 1200);
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
      {/* Tab Selector Bar */}
      <div style={{ display: 'flex', borderBottom: '1px solid var(--border-subtle)', marginBottom: '1.5rem' }}>
        <button
          type="button"
          onClick={() => { setTab('login'); setErrorMsg(''); setSuccessMsg(''); }}
          style={{
            flex: 1,
            padding: '0.65rem',
            background: 'transparent',
            border: 'none',
            borderBottom: tab === 'login' ? '2.5px solid var(--accent-indigo)' : '2.5px solid transparent',
            color: tab === 'login' ? 'var(--accent-indigo)' : 'var(--text-heading)',
            fontWeight: '800',
            fontSize: '0.92rem',
            opacity: tab === 'login' ? 1 : 0.65,
            cursor: 'pointer',
            transition: 'all 0.2s ease'
          }}
        >
          Log In
        </button>
        <button
          type="button"
          onClick={() => { setTab('register'); setErrorMsg(''); setSuccessMsg(''); }}
          style={{
            flex: 1,
            padding: '0.65rem',
            background: 'transparent',
            border: 'none',
            borderBottom: tab === 'register' ? '2.5px solid var(--accent-emerald)' : '2.5px solid transparent',
            color: tab === 'register' ? 'var(--accent-emerald)' : 'var(--text-heading)',
            fontWeight: '800',
            fontSize: '0.92rem',
            opacity: tab === 'register' ? 1 : 0.65,
            cursor: 'pointer',
            transition: 'all 0.2s ease'
          }}
        >
          Sign Up
        </button>
      </div>

      {errorMsg && (
        <div style={{ background: 'rgba(239, 68, 68, 0.12)', border: '1px solid rgba(239, 68, 68, 0.3)', color: '#EF4444', padding: '0.65rem', borderRadius: '8px', fontSize: '0.82rem', marginBottom: '1.25rem' }}>
          ⚠️ {errorMsg}
        </div>
      )}

      {successMsg && (
        <div style={{ background: 'var(--accent-emerald-glow)', border: '1px solid rgba(16, 185, 129, 0.3)', color: 'var(--accent-emerald)', padding: '0.65rem', borderRadius: '8px', fontSize: '0.82rem', marginBottom: '1.25rem' }}>
          ✅ {successMsg}
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', textAlign: 'left' }}>
        {tab === 'register' && (
          <div>
            <label className="form-label">Full Name</label>
            <input
              type="text"
              placeholder="Barkat Bashir"
              value={username}
              onChange={e => setUsername(e.target.value)}
              className="form-input"
              required
            />
          </div>
        )}

        <div>
          <label className="form-label">Email Address</label>
          <input
            type="email"
            placeholder="name@example.com"
            value={email}
            onChange={e => setEmail(e.target.value)}
            className="form-input"
            required
          />
        </div>

        <div>
          <label className="form-label">Password</label>
          <input
            type="password"
            placeholder="••••••••••••"
            value={password}
            onChange={e => setPassword(e.target.value)}
            className="form-input"
            required
          />
        </div>

        <Button type="submit" variant={tab === 'login' ? 'indigo' : 'emerald'} disabled={loading} style={{ width: '100%', padding: '0.85rem', marginTop: '0.5rem', justifyContent: 'center' }}>
          {loading ? 'Processing...' : tab === 'login' ? 'Log In to Naqashly →' : 'Create Account →'}
        </Button>
      </form>
    </Modal>
  );
};
