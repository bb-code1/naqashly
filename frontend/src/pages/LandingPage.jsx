import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { ThemeSwitcher } from '../components/ui/ThemeSwitcher';
import { useAuth } from '../context/AuthContext';
import {
  LANDING_HERO,
  FEATURE_PREVIEWS,
  MICROSERVICE_CARDS
} from '../constants/landingConstants';
import './LandingPage.css';

/**
 * World-Class Public Home Page & Feature Showcase with Rich Motion & Animations for Naqashly Life OS.
 * Features ambient floating radial glow orbs, text shimmers, staggered entrance motion, and interactive preview cards.
 * Supports Obsidian Dark, Luxe Light, Cyberpunk, and Forest themes!
 * 
 * @author Barkat Bashir
 * @version 5.0.0
 */
export const LandingPage = ({ onAuthenticated, onGoToDashboard }) => {
  const [tab, setTab] = useState('login'); // 'login' | 'register'
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [activePreviewTab, setActivePreviewTab] = useState('finance');

  const { isAuthenticated, user, login, register } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    try {
      if (tab === 'login') {
        await login(email, password);
        if (onAuthenticated) onAuthenticated();
      } else {
        await register(name || email.split('@')[0], email, password);
        await login(email, password);
        if (onAuthenticated) onAuthenticated();
      }
    } catch (err) {
      console.error('[LandingPage] Auth error:', err);
      const msg = err.response?.data?.message || err.message || 'Authentication failed. Please check credentials.';
      setErrorMsg(msg);
    } finally {
      setLoading(false);
    }
  };

  const openAuthWithTab = (targetTab) => {
    setTab(targetTab);
    setIsAuthModalOpen(true);
  };

  // Motion Container Variants for Staggered Entrances
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.12,
        delayChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 25 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } }
  };

  return (
    <div className="landing-container">
      
      {/* AMBIENT GLOW ORBS BACKGROUND */}
      <div className="glow-orb glow-orb-emerald" />
      <div className="glow-orb glow-orb-indigo" />

      {/* 1. TOP HEADER NAVIGATION BAR */}
      <nav className="landing-nav">
        {/* Brand Logo */}
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="landing-brand" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
          <div className="brand-icon">N</div>
          <div>
            <span style={{ fontSize: '1.25rem', fontWeight: '800', color: 'var(--text-heading)', letterSpacing: '-0.02em' }}>Naqashly</span>
            <span style={{ fontSize: '0.75rem', color: 'var(--accent-emerald)', fontWeight: '700', marginLeft: '0.4rem' }}>LIFE OS</span>
          </div>
        </motion.div>

        {/* Center Nav Links */}
        <div className="landing-nav-links">
          <a href="#features">✨ Features</a>
          <a href="#finance">🏦 Bank Ledger</a>
          <a href="#budgets">🎯 Budget Engine</a>
          <a href="#architecture">⚡ Microservices</a>
        </div>

        {/* Action Controls */}
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="landing-nav-actions">
          <ThemeSwitcher />

          {isAuthenticated ? (
            <Button variant="emerald" onClick={onGoToDashboard || onAuthenticated} style={{ padding: '0.65rem 1.25rem', fontSize: '0.88rem' }}>
              ⚡ Launch Dashboard →
            </Button>
          ) : (
            <>
              <Button variant="secondary" onClick={() => openAuthWithTab('login')} style={{ padding: '0.6rem 1.15rem', fontSize: '0.85rem' }}>
                Log In
              </Button>
              <Button variant="emerald" onClick={() => openAuthWithTab('register')} style={{ padding: '0.6rem 1.15rem', fontSize: '0.85rem' }}>
                Sign Up Free →
              </Button>
            </>
          )}
        </motion.div>
      </nav>

      {/* 2. HERO SECTION WITH STAGGERED MOTION */}
      <section className="landing-hero-section">
        
        {/* Hero Left Intro */}
        <motion.div initial={{ opacity: 0, x: -40 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.75, ease: 'easeOut' }}>
          <motion.div whileHover={{ scale: 1.03 }} className="hero-badge">
            {LANDING_HERO.badge}
          </motion.div>

          <h1 className="hero-title">
            Master Your <span className="hero-title-gradient">Finances</span>, Routines & Goals in One Unified OS.
          </h1>

          <p className="hero-subtitle">
            {LANDING_HERO.subtitle}
          </p>

          <div className="hero-cta-group">
            {isAuthenticated ? (
              <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}>
                <Button variant="emerald" onClick={onGoToDashboard || onAuthenticated} style={{ padding: '0.9rem 1.8rem', fontSize: '1rem', fontWeight: '700' }}>
                  🚀 Access Your Dashboard Now →
                </Button>
              </motion.div>
            ) : (
              <>
                <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.98 }}>
                  <Button variant="emerald" onClick={() => openAuthWithTab('register')} style={{ padding: '0.9rem 1.8rem', fontSize: '1rem', fontWeight: '700' }}>
                    ✨ Create Free Account →
                  </Button>
                </motion.div>
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Button variant="secondary" onClick={() => openAuthWithTab('login')} style={{ padding: '0.9rem 1.5rem', fontSize: '0.95rem' }}>
                    🔐 Existing User Login
                  </Button>
                </motion.div>
              </>
            )}
          </div>

          {/* Value Badges */}
          <div className="hero-value-badges">
            <div className="value-badge-item">
              <span className="value-check">✓</span> PostgreSQL DB Budget Persistence
            </div>
            <div className="value-badge-item">
              <span className="value-check">✓</span> Bank Running Balance Statements
            </div>
            <div className="value-badge-item">
              <span className="value-check">✓</span> Formatted Excel (.xls) Exporters
            </div>
          </div>
        </motion.div>

        {/* Hero Right Auth & Quick Signup Card */}
        <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.75, delay: 0.2, ease: 'easeOut' }}>
          <div className="landing-auth-card">
            {isAuthenticated ? (
              /* ALREADY LOGGED IN CARD */
              <div style={{ textAlign: 'center', padding: '1rem 0' }}>
                <motion.div animate={{ rotate: [0, 10, -10, 0] }} transition={{ repeat: Infinity, duration: 3 }} style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'var(--accent-emerald-glow)', color: 'var(--accent-emerald)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.9rem', margin: '0 auto 1.25rem' }}>
                  👋
                </motion.div>
                <h3 style={{ fontSize: '1.4rem', fontWeight: '800', color: 'var(--text-heading)', marginBottom: '0.4rem' }}>
                  Welcome Back, {user?.name || 'User'}!
                </h3>
                <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', marginBottom: '1.75rem' }}>
                  You are authenticated and ready to manage your routines, ledger statements, and budget health.
                </p>
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Button variant="emerald" onClick={onGoToDashboard || onAuthenticated} style={{ width: '100%', padding: '0.9rem', fontSize: '0.95rem', justifyContent: 'center' }}>
                    ⚡ Open Life OS Dashboard →
                  </Button>
                </motion.div>
              </div>
            ) : (
              /* SIGNUP / LOGIN FORM CARD */
              <div>
                {/* Form Tab Switcher */}
                <div className="auth-tab-bar">
                  <button
                    type="button"
                    onClick={() => { setTab('register'); setErrorMsg(''); }}
                    className={`auth-tab-btn ${tab === 'register' ? 'register-active' : 'inactive'}`}
                  >
                    ✨ Sign Up Free
                  </button>
                  <button
                    type="button"
                    onClick={() => { setTab('login'); setErrorMsg(''); }}
                    className={`auth-tab-btn ${tab === 'login' ? 'login-active' : 'inactive'}`}
                  >
                    🔐 Log In
                  </button>
                </div>

                <h3 style={{ fontSize: '1.25rem', fontWeight: '800', color: 'var(--text-heading)', marginBottom: '0.3rem' }}>
                  {tab === 'register' ? 'Get Started Free ✨' : 'Welcome Back 👋'}
                </h3>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
                  {tab === 'register' ? 'Create your account to start tracking routines & bank ledgers.' : 'Enter your credentials to access your dashboard.'}
                </p>

                {errorMsg && (
                  <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} style={{ background: 'rgba(239, 68, 68, 0.12)', border: '1px solid rgba(239, 68, 68, 0.3)', color: '#EF4444', padding: '0.65rem', borderRadius: '8px', fontSize: '0.82rem', marginBottom: '1.25rem' }}>
                    ⚠️ {errorMsg}
                  </motion.div>
                )}

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
                  {tab === 'register' && (
                    <div>
                      <label className="form-label">Full Name</label>
                      <input
                        type="text"
                        placeholder="Barkat Bashir"
                        value={name}
                        onChange={e => setName(e.target.value)}
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

                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Button type="submit" variant={tab === 'register' ? 'emerald' : 'indigo'} disabled={loading} style={{ width: '100%', padding: '0.85rem', fontSize: '0.95rem', marginTop: '0.4rem', justifyContent: 'center' }}>
                      {loading ? 'Processing...' : tab === 'register' ? 'Create Free Account →' : 'Log In to Dashboard →'}
                    </Button>
                  </motion.div>
                </form>
              </div>
            )}
          </div>
        </motion.div>

      </section>

      {/* 3. LIVE STATS HIGHLIGHT BANNER */}
      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.3 }} className="stats-banner">
        <div className="stat-item">
          <span className="stat-icon">⚙️</span>
          <div>
            <div className="stat-title">Architecture</div>
            <div className="stat-value">7 Microservices</div>
          </div>
        </div>

        <div className="stat-item">
          <span className="stat-icon">🔒</span>
          <div>
            <div className="stat-title">Authentication</div>
            <div className="stat-value">RS256 JWKS JWT</div>
          </div>
        </div>

        <div className="stat-item">
          <span className="stat-icon">🇮🇳</span>
          <div>
            <div className="stat-title">Default Currency</div>
            <div className="stat-value">Indian Rupee (₹)</div>
          </div>
        </div>

        <div className="stat-item">
          <span className="stat-icon">🎨</span>
          <div>
            <div className="stat-title">Theme Engine</div>
            <div className="stat-value">0ms Instant Switch</div>
          </div>
        </div>
      </motion.div>

      {/* 4. INTERACTIVE FEATURE PREVIEW SUITE WITH ANIMATED TAB INDICATOR */}
      <section id="features" className="landing-feature-section">
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <Badge variant="indigo">⚡ Interactive Product Preview</Badge>
          <h2 style={{ fontSize: '2.2rem', fontWeight: '800', color: 'var(--text-heading)', letterSpacing: '-0.03em', marginTop: '0.75rem' }}>
            Four Core Pillars. One Seamless Operating System.
          </h2>
          <p style={{ fontSize: '0.95rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
            Click below to preview live features across Naqashly's four primary domains.
          </p>
        </div>

        {/* Feature Preview Selector Tabs */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '0.75rem', marginBottom: '2.5rem', flexWrap: 'wrap' }}>
          {FEATURE_PREVIEWS.map(p => (
            <button
              key={p.key}
              onClick={() => setActivePreviewTab(p.key)}
              className={`preview-tab-btn ${activePreviewTab === p.key ? 'active' : 'inactive'}`}
            >
              {p.icon} {p.label}
            </button>
          ))}
        </div>

        {/* Live Mockup Preview Box with AnimatePresence */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activePreviewTab}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.3 }}
            className="landing-auth-card"
            style={{ padding: '2.5rem' }}
          >
            {activePreviewTab === 'finance' && (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
                  <div>
                    <h3 style={{ fontSize: '1.35rem', fontWeight: '800', color: 'var(--text-heading)', margin: 0 }}>
                      🏦 Interpersonal Bank Ledger & PostgreSQL Category Budgets (INR ₹)
                    </h3>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                      Double-entry running balance statements, 2-term event directions, and real-time category health tracking.
                    </p>
                  </div>
                  <Badge variant="emerald">PostgreSQL Live</Badge>
                </div>

                {/* Sample Horizontal Metric Row */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '1.75rem' }}>
                  <div style={{ background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-subtle)', padding: '0.85rem 1rem', borderRadius: '10px' }}>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Total Monthly Inflow</div>
                    <div style={{ fontSize: '1.2rem', fontWeight: '800', color: 'var(--accent-emerald)', fontFamily: 'var(--font-mono)' }}>+₹45,000.00</div>
                  </div>
                  <div style={{ background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-subtle)', padding: '0.85rem 1rem', borderRadius: '10px' }}>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Total Monthly Outflow</div>
                    <div style={{ fontSize: '1.2rem', fontWeight: '800', color: 'var(--accent-danger)', fontFamily: 'var(--font-mono)' }}>-₹12,400.00</div>
                  </div>
                  <div style={{ background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-subtle)', padding: '0.85rem 1rem', borderRadius: '10px' }}>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Total Target Budget</div>
                    <div style={{ fontSize: '1.2rem', fontWeight: '800', color: 'var(--text-heading)', fontFamily: 'var(--font-mono)' }}>₹38,000.00</div>
                  </div>
                  <div style={{ background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-subtle)', padding: '0.85rem 1rem', borderRadius: '10px' }}>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Budget Health</div>
                    <div style={{ fontSize: '1.2rem', fontWeight: '800', color: 'var(--accent-emerald)', fontFamily: 'var(--font-mono)' }}>32.6% Used</div>
                  </div>
                </div>

                {/* Sample Animated Category Progress Bars */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div style={{ background: 'var(--bg-surface-elevated)', padding: '1rem', borderRadius: '10px', border: '1px solid var(--border-subtle)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem', fontWeight: '700', marginBottom: '0.5rem' }}>
                      <span>🍔 Food & Dining (₹3,200 spent of ₹15,000 target)</span>
                      <Badge variant="emerald">🟢 ₹11,800.00 Left</Badge>
                    </div>
                    <div style={{ height: '8px', background: 'var(--bg-surface)', borderRadius: '4px', overflow: 'hidden' }}>
                      <motion.div initial={{ width: 0 }} animate={{ width: '21.3%' }} transition={{ duration: 1, ease: 'easeOut' }} style={{ height: '100%', background: '#F59E0B', borderRadius: '4px' }} />
                    </div>
                  </div>

                  <div style={{ background: 'var(--bg-surface-elevated)', padding: '1rem', borderRadius: '10px', border: '1px solid var(--border-subtle)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem', fontWeight: '700', marginBottom: '0.5rem' }}>
                      <span>💡 Bills & Utilities (₹8,900 spent of ₹10,000 target)</span>
                      <Badge variant="amber">🟡 Near Limit (₹1,100.00 left)</Badge>
                    </div>
                    <div style={{ height: '8px', background: 'var(--bg-surface)', borderRadius: '4px', overflow: 'hidden' }}>
                      <motion.div initial={{ width: 0 }} animate={{ width: '89%' }} transition={{ duration: 1, ease: 'easeOut', delay: 0.15 }} style={{ height: '100%', background: '#F59E0B', borderRadius: '4px' }} />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activePreviewTab === 'routine' && (
              <div>
                <h3 style={{ fontSize: '1.35rem', fontWeight: '800', color: 'var(--text-heading)', marginBottom: '0.5rem' }}>
                  🌿 Routine Engine & Habit Flow (`routine-service` :8085)
                </h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
                  Non-hardcoded 24-hour routine grace window logging, streak freezes, and visual habit timelines.
                </p>
                <div style={{ background: 'var(--bg-surface-elevated)', padding: '1.5rem', borderRadius: '10px', border: '1px solid var(--border-subtle)', textAlign: 'center' }}>
                  <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>⏰</div>
                  <div style={{ fontWeight: '700', fontSize: '1.1rem', color: 'var(--text-heading)' }}>24-Hour Visual Habit Timeline Active</div>
                  <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '0.3rem' }}>Includes 2-Hour Grace Window logging to prevent missed streaks.</div>
                </div>
              </div>
            )}

            {activePreviewTab === 'productivity' && (
              <div>
                <h3 style={{ fontSize: '1.35rem', fontWeight: '800', color: 'var(--text-heading)', marginBottom: '0.5rem' }}>
                  🎯 Focus & Goal Sliders (`productivity-service` :8083)
                </h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
                  Timeline goals (0% - 100%) with 300ms debounced updates and task priority checklists.
                </p>
                <div style={{ background: 'var(--bg-surface-elevated)', padding: '1.5rem', borderRadius: '10px', border: '1px solid var(--border-subtle)', textAlign: 'center' }}>
                  <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>🎯</div>
                  <div style={{ fontWeight: '700', fontSize: '1.1rem', color: 'var(--text-heading)' }}>Real-Time Goal Sliders & Task Board</div>
                  <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '0.3rem' }}>Debounced 300ms async persistence directly to PostgreSQL.</div>
                </div>
              </div>
            )}

            {activePreviewTab === 'journal' && (
              <div>
                <h3 style={{ fontSize: '1.35rem', fontWeight: '800', color: 'var(--text-heading)', marginBottom: '0.5rem' }}>
                  📝 Knowledge & Mind Journal (`journal-service` :8086)
                </h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
                  Markdown daily reflections, work status logger (Office Work / Seeking Job), and document links.
                </p>
                <div style={{ background: 'var(--bg-surface-elevated)', padding: '1.5rem', borderRadius: '10px', border: '1px solid var(--border-subtle)', textAlign: 'center' }}>
                  <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>🧠</div>
                  <div style={{ fontWeight: '700', fontSize: '1.1rem', color: 'var(--text-heading)' }}>Markdown Reflection & Note Vault</div>
                  <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '0.3rem' }}>Isolated PostgreSQL storage per user account.</div>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </section>

      {/* 5. ENTERPRISE MICROSERVICES ARCHITECTURE SECTION WITH STAGGERED MOTION */}
      <section id="architecture" className="landing-microservices-section">
        <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
          <Badge variant="amber">⚙️ Microservices Architecture</Badge>
          <h2 style={{ fontSize: '2.2rem', fontWeight: '800', color: 'var(--text-heading)', letterSpacing: '-0.03em', marginTop: '0.75rem' }}>
            Built on Enterprise Spring Boot Ecosystem
          </h2>
          <p style={{ fontSize: '0.95rem', color: 'var(--text-muted)', marginTop: '0.4rem' }}>
            Every domain runs independently as an isolated Spring Boot microservice backed by PostgreSQL.
          </p>
        </div>

        <motion.div variants={containerVariants} initial="hidden" whileInView="visible" viewport={{ once: true }} className="microservice-grid">
          {MICROSERVICE_CARDS.map((item, idx) => (
            <motion.div key={idx} variants={itemVariants} whileHover={{ y: -8, scale: 1.02 }} className="microservice-card">
              <div style={{ fontSize: '2.2rem', marginBottom: '0.75rem' }}>{item.icon}</div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: '800', color: 'var(--text-heading)', marginBottom: '0.2rem' }}>{item.title}</h3>
              <div style={{ fontSize: '0.75rem', color: 'var(--accent-emerald)', fontWeight: '700', marginBottom: '0.85rem', fontFamily: 'var(--font-mono)' }}>{item.port}</div>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', lineHeight: '1.55' }}>{item.desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* 6. FOOTER */}
      <footer style={{ borderTop: '1px solid var(--border-subtle)', background: 'var(--bg-surface)', textAlign: 'center', padding: '2.5rem 2rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.6rem', marginBottom: '0.75rem' }}>
          <strong style={{ color: 'var(--text-heading)' }}>Naqashly Life OS</strong> • Enterprise Microservice Architecture
        </div>
        <div>
          Authored by <strong style={{ color: 'var(--text-heading)' }}>Barkat Bashir</strong> &copy; 2026. All rights reserved.
        </div>
      </footer>

      {/* 7. POPUP AUTH MODAL FOR LOG IN / SIGN UP CTA BUTTONS */}
      <AnimatePresence>
        {isAuthModalOpen && (
          <div className="modal-overlay">
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="modal-dialog wallet-modal">
              <div className="modal-header">
                <div>
                  <h3 className="modal-title">{tab === 'register' ? '✨ Sign Up Free Account' : '🔐 Log In to Naqashly'}</h3>
                  <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>Secured by Spring Boot RS256 JWT & PostgreSQL</p>
                </div>
                <button type="button" onClick={() => setIsAuthModalOpen(false)} className="modal-close-btn">✕</button>
              </div>

              {errorMsg && (
                <div style={{ background: 'rgba(239, 68, 68, 0.12)', border: '1px solid rgba(239, 68, 68, 0.3)', color: '#EF4444', padding: '0.65rem', borderRadius: '8px', fontSize: '0.82rem', marginBottom: '1rem' }}>
                  ⚠️ {errorMsg}
                </div>
              )}

              <form onSubmit={handleSubmit} className="modal-form">
                {tab === 'register' && (
                  <div>
                    <label className="form-label">Full Name</label>
                    <input type="text" placeholder="Barkat Bashir" value={name} onChange={e => setName(e.target.value)} className="form-input" required />
                  </div>
                )}

                <div>
                  <label className="form-label">Email Address</label>
                  <input type="email" placeholder="name@example.com" value={email} onChange={e => setEmail(e.target.value)} className="form-input" required />
                </div>

                <div>
                  <label className="form-label">Password</label>
                  <input type="password" placeholder="••••••••••••" value={password} onChange={e => setPassword(e.target.value)} className="form-input" required />
                </div>

                <div className="form-actions" style={{ justifyContent: 'space-between', alignItems: 'center', marginTop: '0.5rem' }}>
                  <button
                    type="button"
                    onClick={() => { setTab(tab === 'login' ? 'register' : 'login'); setErrorMsg(''); }}
                    style={{ background: 'none', border: 'none', color: 'var(--accent-emerald)', fontSize: '0.82rem', fontWeight: '700', cursor: 'pointer' }}
                  >
                    {tab === 'login' ? 'Need an account? Sign Up' : 'Already have an account? Log In'}
                  </button>

                  <Button type="submit" variant={tab === 'register' ? 'emerald' : 'indigo'} disabled={loading}>
                    {loading ? 'Processing...' : tab === 'register' ? 'Sign Up →' : 'Log In →'}
                  </Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};
