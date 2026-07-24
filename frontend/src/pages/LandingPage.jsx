import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { ThemeSwitcher } from '../components/ui/ThemeSwitcher';
import { useAuth } from '../context/AuthContext';
import {
  LANDING_HERO,
  HOW_IT_WORKS_STEPS,
  FEATURE_PREVIEWS,
  VALUE_PILLARS,
  FAQS
} from '../constants/landingConstants';
import './LandingPage.css';

/**
 * World-Class High-Converting Public Home Page for Naqashly.
 * Features Interactive Budget Savings Calculator, 3-Step Walkthrough, FAQ Accordion, and Theme Controls.
 * Supports Obsidian Dark, Luxe Light, Cyberpunk, and Forest themes!
 * 
 * @author Barkat Bashir
 * @version 8.0.0
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

  // Calculator State (INR ₹)
  const [calcMonthlyIncome, setCalcMonthlyIncome] = useState(60000);
  const [calcSavingsTarget, setCalcSavingsTarget] = useState(25); // 25% target

  // FAQ Accordion Open State
  const [openFaqIndex, setOpenFaqIndex] = useState(0);

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

  // Live Calculator Computations in INR (₹)
  const monthlySavingsAmount = (calcMonthlyIncome * calcSavingsTarget) / 100;
  const annualSavingsAmount = monthlySavingsAmount * 12;

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
            <span style={{ fontSize: '0.75rem', color: 'var(--accent-emerald)', fontWeight: '700', marginLeft: '0.4rem' }}>PERSONAL</span>
          </div>
        </motion.div>

        {/* Center Nav Links */}
        <div className="landing-nav-links">
          <a href="#how-it-works">⚙️ How It Works</a>
          <a href="#features">✨ Features</a>
          <a href="#calculator">🧮 Savings Calculator</a>
          <a href="#faqs">❓ FAQs</a>
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
            Take Control of Your <span className="hero-title-gradient">Money</span>, Habits & Daily Goals.
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
              <span className="value-check">✓</span> Monthly Target Budgets
            </div>
            <div className="value-badge-item">
              <span className="value-check">✓</span> Bank Running Net Statements
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
                    ⚡ Open Dashboard →
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

      {/* 3. CONSUMER HIGHLIGHT BANNER */}
      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.3 }} className="stats-banner">
        <div className="stat-item">
          <span className="stat-icon">⚡</span>
          <div>
            <div className="stat-title">Performance</div>
            <div className="stat-value">Instant Live Sync</div>
          </div>
        </div>

        <div className="stat-item">
          <span className="stat-icon">🔒</span>
          <div>
            <div className="stat-title">Privacy Guard</div>
            <div className="stat-value">Zero Data Tracking</div>
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

      {/* 4. HOW IT WORKS 3-STEP WALKTHROUGH SECTION */}
      <section id="how-it-works" className="landing-microservices-section">
        <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
          <Badge variant="emerald">⚙️ Simple 3-Step Process</Badge>
          <h2 style={{ fontSize: '2.2rem', fontWeight: '800', color: 'var(--text-heading)', letterSpacing: '-0.03em', marginTop: '0.75rem' }}>
            How Naqashly Works for You
          </h2>
          <p style={{ fontSize: '0.95rem', color: 'var(--text-muted)', marginTop: '0.4rem' }}>
            Get started in under 60 seconds with total control over your daily life.
          </p>
        </div>

        <div className="how-it-works-grid">
          {HOW_IT_WORKS_STEPS.map((stepItem, idx) => (
            <motion.div key={idx} whileHover={{ y: -6 }} className="step-card">
              <span className="step-number">STEP {stepItem.step}</span>
              <div style={{ fontSize: '2.2rem', marginBottom: '0.75rem' }}>{stepItem.icon}</div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: '800', color: 'var(--text-heading)', marginBottom: '0.4rem' }}>{stepItem.title}</h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: '1.6' }}>{stepItem.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* 5. INTERACTIVE BUDGET SAVINGS CALCULATOR SECTION */}
      <section id="calculator" className="landing-feature-section">
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <Badge variant="amber">🧮 Interactive Financial Planner</Badge>
          <h2 style={{ fontSize: '2.2rem', fontWeight: '800', color: 'var(--text-heading)', letterSpacing: '-0.03em', marginTop: '0.75rem' }}>
            Calculate Your Target Monthly Savings
          </h2>
          <p style={{ fontSize: '0.95rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
            See how much you can build in wealth by enforcing Naqashly target category budgets in INR (₹).
          </p>
        </div>

        <div className="calc-card" style={{ maxWidth: '900px', margin: '0 auto' }}>
          <div className="form-grid-2" style={{ gap: '2.5rem', alignItems: 'center' }}>
            
            {/* Left Controls */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.88rem', fontWeight: '700' }}>
                  <span>Monthly Inflow / Income</span>
                  <span style={{ color: 'var(--accent-emerald)', fontFamily: 'var(--font-mono)' }}>₹{calcMonthlyIncome.toLocaleString('en-IN')}</span>
                </div>
                <input
                  type="range"
                  min="20000"
                  max="300000"
                  step="5000"
                  value={calcMonthlyIncome}
                  onChange={e => setCalcMonthlyIncome(Number(e.target.value))}
                  className="calc-slider"
                />
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.88rem', fontWeight: '700' }}>
                  <span>Target Savings Allocation</span>
                  <span style={{ color: 'var(--accent-amber)', fontFamily: 'var(--font-mono)' }}>{calcSavingsTarget}%</span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="60"
                  step="5"
                  value={calcSavingsTarget}
                  onChange={e => setCalcSavingsTarget(Number(e.target.value))}
                  className="calc-slider"
                />
              </div>
            </div>

            {/* Right Output Card */}
            <div style={{ background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-highlight)', padding: '1.75rem', borderRadius: '16px', textAlign: 'center' }}>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: '700' }}>ESTIMATED MONTHLY SAVINGS</div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '2.2rem', fontWeight: '800', color: 'var(--accent-emerald)', margin: '0.4rem 0 1rem' }}>
                +₹{monthlySavingsAmount.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
              </div>

              <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '1rem', display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>Projected 1-Year Wealth Growth:</span>
                <strong style={{ color: 'var(--accent-amber)', fontFamily: 'var(--font-mono)', fontSize: '1rem' }}>
                  ₹{annualSavingsAmount.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                </strong>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 6. INTERACTIVE FEATURE PREVIEW SUITE */}
      <section id="features" className="landing-feature-section">
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <Badge variant="indigo">⚡ Interactive Product Preview</Badge>
          <h2 style={{ fontSize: '2.2rem', fontWeight: '800', color: 'var(--text-heading)', letterSpacing: '-0.03em', marginTop: '0.75rem' }}>
            Four Core Pillars. One Powerful Personal Workspace.
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
                      🏦 Interpersonal Bank Ledger & Target Category Budgets (INR ₹)
                    </h3>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                      Double-entry running balance statements, 2-term event directions, and real-time category health tracking.
                    </p>
                  </div>
                  <Badge variant="emerald">Live Data Vault</Badge>
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
                  🌿 Daily Routine Engine & Streak Protection
                </h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
                  24-hour visual routine timelines, 2-hour grace window logging, and streak freeze passes.
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
                  🎯 Focus & Goal Progress Trackers
                </h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
                  Interactive timeline goals (0% - 100%) with real-time sync and task priority checklists.
                </p>
                <div style={{ background: 'var(--bg-surface-elevated)', padding: '1.5rem', borderRadius: '10px', border: '1px solid var(--border-subtle)', textAlign: 'center' }}>
                  <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>🎯</div>
                  <div style={{ fontWeight: '700', fontSize: '1.1rem', color: 'var(--text-heading)' }}>Real-Time Goal Sliders & Task Board</div>
                  <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '0.3rem' }}>Instant progress saving with automatic debouncing.</div>
                </div>
              </div>
            )}

            {activePreviewTab === 'journal' && (
              <div>
                <h3 style={{ fontSize: '1.35rem', fontWeight: '800', color: 'var(--text-heading)', marginBottom: '0.5rem' }}>
                  📝 Knowledge & Mind Vault
                </h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
                  Markdown daily reflections, work status logger (Office Work / Seeking Job), and document vaults.
                </p>
                <div style={{ background: 'var(--bg-surface-elevated)', padding: '1.5rem', borderRadius: '10px', border: '1px solid var(--border-subtle)', textAlign: 'center' }}>
                  <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>🧠</div>
                  <div style={{ fontWeight: '700', fontSize: '1.1rem', color: 'var(--text-heading)' }}>Markdown Reflection & Note Vault</div>
                  <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '0.3rem' }}>Private encrypted storage per user account.</div>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </section>

      {/* 7. CONSUMER VALUE PILLARS SECTION */}
      <section id="pillars" className="landing-microservices-section">
        <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
          <Badge variant="amber">🛡️ Built for Your Life</Badge>
          <h2 style={{ fontSize: '2.2rem', fontWeight: '800', color: 'var(--text-heading)', letterSpacing: '-0.03em', marginTop: '0.75rem' }}>
            Why People Choose Naqashly
          </h2>
          <p style={{ fontSize: '0.95rem', color: 'var(--text-muted)', marginTop: '0.4rem' }}>
            Designed from the ground up for privacy, financial clarity, and personal discipline.
          </p>
        </div>

        <motion.div variants={containerVariants} initial="hidden" whileInView="visible" viewport={{ once: true }} className="microservice-grid">
          {VALUE_PILLARS.map((item, idx) => (
            <motion.div key={idx} variants={itemVariants} whileHover={{ y: -8, scale: 1.02 }} className="microservice-card">
              <div style={{ fontSize: '2.2rem', marginBottom: '0.75rem' }}>{item.icon}</div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: '800', color: 'var(--text-heading)', marginBottom: '0.2rem' }}>{item.title}</h3>
              <div style={{ fontSize: '0.75rem', color: 'var(--accent-emerald)', fontWeight: '700', marginBottom: '0.85rem' }}>{item.tag}</div>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', lineHeight: '1.55' }}>{item.desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* 8. INTERACTIVE FAQ ACCORDION SECTION */}
      <section id="faqs" className="landing-microservices-section" style={{ paddingTop: 0 }}>
        <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
          <Badge variant="indigo">❓ Clear Answers</Badge>
          <h2 style={{ fontSize: '2.2rem', fontWeight: '800', color: 'var(--text-heading)', letterSpacing: '-0.03em', marginTop: '0.75rem' }}>
            Frequently Asked Questions
          </h2>
          <p style={{ fontSize: '0.95rem', color: 'var(--text-muted)', marginTop: '0.4rem' }}>
            Everything you need to know about Naqashly ledgers, budgets, and privacy.
          </p>
        </div>

        <div className="faq-container">
          {FAQS.map((faq, idx) => {
            const isOpen = openFaqIndex === idx;
            return (
              <div key={idx} className="faq-item">
                <button
                  type="button"
                  onClick={() => setOpenFaqIndex(isOpen ? -1 : idx)}
                  className="faq-question-btn"
                >
                  <span>{faq.question}</span>
                  <span style={{ color: 'var(--accent-emerald)', fontSize: '1.2rem', transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.25s ease' }}>
                    ▼
                  </span>
                </button>

                <AnimatePresence>
                  {isOpen && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.25 }}
                      className="faq-answer"
                    >
                      {faq.answer}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </section>

      {/* 9. FOOTER */}
      <footer style={{ borderTop: '1px solid var(--border-subtle)', background: 'var(--bg-surface)', textAlign: 'center', padding: '2.5rem 2rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.6rem', marginBottom: '0.75rem' }}>
          <strong style={{ color: 'var(--text-heading)' }}>Naqashly</strong> • Personal Productivity & Financial Control Suite
        </div>
        <div>
          Authored by <strong style={{ color: 'var(--text-heading)' }}>Barkat Bashir</strong> &copy; 2026. All rights reserved.
        </div>
      </footer>

      {/* 10. POPUP AUTH MODAL FOR LOG IN / SIGN UP CTA BUTTONS */}
      <AnimatePresence>
        {isAuthModalOpen && (
          <div className="modal-overlay">
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="modal-dialog wallet-modal">
              <div className="modal-header">
                <div>
                  <h3 className="modal-title">{tab === 'register' ? '✨ Sign Up Free Account' : '🔐 Log In to Naqashly'}</h3>
                  <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>Encrypted Private Data Vault</p>
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
