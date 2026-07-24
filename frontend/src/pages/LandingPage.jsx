import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { ThemeSwitcher } from '../components/ui/ThemeSwitcher';
import { useAuth } from '../context/AuthContext';

/**
 * Public Landing & Login Home Page for Naqashly Life OS.
 * Fully theme-aware supporting Obsidian Dark, Luxe Light, Cyberpunk, and Forest themes!
 * 
 * @author Barkat Bashir
 * @version 2.0.0
 */
export const LandingPage = ({ onAuthenticated }) => {
  const [tab, setTab] = useState('login'); // 'login' | 'register'
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const { login, register } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    try {
      if (tab === 'login') {
        await login(email, password);
        onAuthenticated();
      } else {
        await register(name || email.split('@')[0], email, password);
        await login(email, password);
        onAuthenticated();
      }
    } catch (err) {
      console.error('[LandingPage] Auth error:', err);
      const msg = err.response?.data?.message || err.message || 'Authentication failed. Please check credentials.';
      setErrorMsg(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-base)', color: 'var(--text-body)', overflowX: 'hidden' }}>
      {/* Top Navbar */}
      <nav style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '1.25rem 3rem', borderBottom: '1px solid var(--border-subtle)',
        background: 'var(--bg-surface)', backdropFilter: 'blur(20px)',
        boxShadow: 'var(--card-shadow)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          <div style={{
            width: '40px', height: '40px', borderRadius: '12px',
            background: 'linear-gradient(135deg, var(--accent-emerald) 0%, var(--accent-indigo) 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#FFF', fontWeight: '800', fontSize: '1.25rem', boxShadow: '0 0 24px rgba(16, 185, 129, 0.3)'
          }}>
            N
          </div>
          <div>
            <span style={{ fontSize: '1.2rem', fontWeight: '800', color: 'var(--text-heading)', letterSpacing: '-0.02em' }}>Naqashly</span>
            <span style={{ fontSize: '0.75rem', color: 'var(--accent-indigo)', fontWeight: '600', marginLeft: '0.4rem' }}>LIFE OS</span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <Badge variant="indigo">v1.0.0 Enterprise Microservices</Badge>
          <ThemeSwitcher />
          <Button onClick={() => { setTab('login'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}>Log In</Button>
        </div>
      </nav>

      {/* Hero Section */}
      <section style={{ maxWidth: '1200px', margin: '0 auto', padding: '4rem 2rem', display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '3.5rem', alignItems: 'center' }}>
        {/* Hero Left Content */}
        <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'var(--accent-emerald-glow)', border: '1px solid rgba(16, 185, 129, 0.3)', padding: '0.4rem 0.9rem', borderRadius: '9999px', fontSize: '0.8rem', fontWeight: '600', color: 'var(--accent-emerald)', marginBottom: '1.5rem' }}>
            ✨ Personal Accountability & Life Operating System
          </div>

          <h1 style={{ fontSize: '3rem', fontWeight: '800', color: 'var(--text-heading)', lineHeight: '1.15', letterSpacing: '-0.03em', marginBottom: '1.25rem' }}>
            Master Your Routine, Finances & Goals in One Unified Suite.
          </h1>

          <p style={{ fontSize: '1.05rem', color: 'var(--text-muted)', lineHeight: '1.6', marginBottom: '2rem' }}>
            Powered by 7 reactive Spring Boot microservices, RS256 JWT security, non-hardcoded 24-hour routine grace windows, interpersonal debt ledgers, and multi-channel Telegram & WhatsApp bot ingress.
          </p>

          <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              <span style={{ color: 'var(--accent-emerald)', fontWeight: 'bold' }}>✓</span> 0ms Theme Engine
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              <span style={{ color: 'var(--accent-emerald)', fontWeight: 'bold' }}>✓</span> 7 Isolated PostgreSQL Databases
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              <span style={{ color: 'var(--accent-emerald)', fontWeight: 'bold' }}>✓</span> Redis Token Revocation
            </div>
          </div>
        </motion.div>

        {/* Hero Right Auth Card */}
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }}>
          <div style={{
            background: 'var(--bg-surface)', border: '1px solid var(--border-highlight)',
            borderRadius: 'var(--radius-lg)', padding: '2.25rem', backdropFilter: 'blur(24px)',
            boxShadow: 'var(--card-shadow)'
          }}>
            {/* Tab Selector */}
            <div style={{ display: 'flex', borderBottom: '1px solid var(--border-subtle)', marginBottom: '1.5rem' }}>
              <button
                onClick={() => { setTab('login'); setErrorMsg(''); }}
                style={{
                  flex: 1, padding: '0.75rem', background: 'transparent', border: 'none',
                  borderBottom: tab === 'login' ? '2px solid var(--accent-indigo)' : 'none',
                  color: tab === 'login' ? 'var(--text-heading)' : 'var(--text-muted)',
                  fontWeight: '700', fontSize: '0.95rem', cursor: 'pointer'
                }}
              >
                Log In
              </button>
              <button
                onClick={() => { setTab('register'); setErrorMsg(''); }}
                style={{
                  flex: 1, padding: '0.75rem', background: 'transparent', border: 'none',
                  borderBottom: tab === 'register' ? '2px solid var(--accent-indigo)' : 'none',
                  color: tab === 'register' ? 'var(--text-heading)' : 'var(--text-muted)',
                  fontWeight: '700', fontSize: '0.95rem', cursor: 'pointer'
                }}
              >
                Sign Up
              </button>
            </div>

            <h3 style={{ fontSize: '1.25rem', fontWeight: '700', color: 'var(--text-heading)', marginBottom: '0.4rem' }}>
              {tab === 'login' ? 'Welcome Back 👋' : 'Create Your Account ✨'}
            </h3>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
              {tab === 'login' ? 'Sign in to access your personal dashboard.' : 'Start managing your routines and finances today.'}
            </p>

            {errorMsg && (
              <div style={{ background: 'rgba(239, 68, 68, 0.12)', border: '1px solid rgba(239, 68, 68, 0.3)', color: '#EF4444', padding: '0.65rem', borderRadius: '8px', fontSize: '0.82rem', marginBottom: '1.25rem' }}>
                ⚠️ {errorMsg}
              </div>
            )}

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {tab === 'register' && (
                <div>
                  <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.3rem' }}>Full Name</label>
                  <input
                    type="text"
                    placeholder="Barkat Bashir"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    style={{ width: '100%', padding: '0.75rem', background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-subtle)', color: 'var(--text-heading)', borderRadius: '10px' }}
                    required
                  />
                </div>
              )}

              <div>
                <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.3rem' }}>Email Address</label>
                <input
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  style={{ width: '100%', padding: '0.75rem', background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-subtle)', color: 'var(--text-heading)', borderRadius: '10px' }}
                  required
                />
              </div>

              <div>
                <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.3rem' }}>Password</label>
                <input
                  type="password"
                  placeholder="••••••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  style={{ width: '100%', padding: '0.75rem', background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-subtle)', color: 'var(--text-heading)', borderRadius: '10px' }}
                  required
                />
              </div>

              <Button type="submit" disabled={loading} style={{ width: '100%', padding: '0.85rem', fontSize: '0.95rem', marginTop: '0.5rem' }}>
                {loading ? 'Authenticating...' : tab === 'login' ? 'Log In to Dashboard →' : 'Create Free Account →'}
              </Button>
            </form>
          </div>
        </motion.div>
      </section>

      {/* Feature Showcase Grid */}
      <section style={{ maxWidth: '1200px', margin: '0 auto', padding: '3rem 2rem 6rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <h2 style={{ fontSize: '1.85rem', fontWeight: '800', color: 'var(--text-heading)', letterSpacing: '-0.02em' }}>
            Built on Enterprise Microservices Architecture
          </h2>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginTop: '0.4rem' }}>
            Every domain runs independently as a standalone microservice backed by PostgreSQL.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem' }}>
          {[
            { icon: '🌿', title: 'Routine & Habit Flow', service: 'routine-service :8085', desc: '24-hour visual progress timeline, 2-hour grace window logging, and streak freeze passes.' },
            { icon: '💰', title: 'Naqashly Ledger', service: 'finance-service :8082', desc: 'Multi-wallet account management, income/expense tracker, and interpersonal debt ledger.' },
            { icon: '🎯', title: 'Focus & Goal Sliders', service: 'productivity-service :8083', desc: 'Timeline goals (0% - 100%) with 300ms debounced updates and task priority checklists.' },
            { icon: '📝', title: 'Knowledge & Mind', service: 'journal-service :8086', desc: 'Markdown notes, work reflection logger (Office Work / Seeking Job), and document links.' }
          ].map((item, idx) => (
            <motion.div key={idx} whileHover={{ y: -5 }} style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', padding: '1.5rem', boxShadow: 'var(--card-shadow)' }}>
              <div style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>{item.icon}</div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: '700', color: 'var(--text-heading)', marginBottom: '0.35rem' }}>{item.title}</h3>
              <div style={{ fontSize: '0.72rem', color: 'var(--accent-indigo)', fontWeight: '600', marginBottom: '0.75rem', fontFamily: 'var(--font-mono)' }}>{item.service}</div>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', lineHeight: '1.5' }}>{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer style={{ borderTop: '1px solid var(--border-subtle)', textAlign: 'center', padding: '2rem', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
        Naqashly Life OS &copy; 2026. Microservices & React Architecture by Barkat Bashir.
      </footer>
    </div>
  );
};
